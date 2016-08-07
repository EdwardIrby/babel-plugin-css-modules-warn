import template from 'babel-template';
import * as t from 'babel-types';

const isProduction = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'testing';

const checkClasses = (() => { // eslint-disable-line arrow-body-style
  return template(`(function () {
    if( typeof SOURCE !== 'undefined' ){
      var RE1 = /\___(\\w+)\__/g
      var RE2 = /undefined/.test(SOURCE)
      var TEST = RE1.test(SOURCE)
      if(TEST){
        var CLASSES = SOURCE.match(RE1)
        console.warn("Looks like you're missing a space between your classes, "+ CLASSES + ". Please use the classnames"+
        "  node module or the following pattern: className={ styles['Class1'] + ' ' + styles['Class2'] }")
      }
      if(RE2){
        console.warn("Looks like one or more classes are undefined, " + SOURCE +
        ". Please verify the key(s), styles['key'], is correct")
      }
    }else{
      console.warn('You appear to have entered an undefined key(s) for your className '+
      'Please verify the key(s) is correct')
    }
    return SOURCE
  })()`);
})();

const getValue = path => {
  const dast = checkClasses({
    SOURCE: path.node.value.expression || path.node.value,
    CLASSES: path.scope.generateUidIdentifier('classes'),
    TEST: path.scope.generateUidIdentifier('test'),
    RE1: path.scope.generateUidIdentifier('re'),
    RE2: path.scope.generateUidIdentifier('re'),
  });
  return dast.expression;
};

const JSXAttributeVisitor = path => {
  path.traverse({ JSXAttribute: JSXAttributeVisitor });
  if (path.node.name.name !== 'className' || isProduction) return;
  path.node.value = t.jSXExpressionContainer( // eslint-disable-line no-param-reassign
    getValue(path)
  );
};

export default function () {
  return {
    visitor: {
      JSXAttribute: JSXAttributeVisitor,
    },
  };
}
