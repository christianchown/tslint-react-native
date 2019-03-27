'use strict';
var __extends =
  (this && this.__extends) ||
  (function() {
    var extendStatics = function(d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function(d, b) {
            d.__proto__ = b;
          }) ||
        function(d, b) {
          for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function(d, b) {
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
    };
  })();
var __importStar =
  (this && this.__importStar) ||
  function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result['default'] = mod;
    return result;
  };
Object.defineProperty(exports, '__esModule', { value: true });
var ts = __importStar(require('typescript'));
var Lint = __importStar(require('tslint'));
var Rule = /** @class */ (function(_super) {
  __extends(Rule, _super);
  function Rule() {
    return (_super !== null && _super.apply(this, arguments)) || this;
  }
  Rule.prototype.apply = function(sourceFile) {
    return this.applyWithWalker(new NoUnusedStylesWalker(sourceFile, this.getOptions()));
  };
  Rule.FAILURE_STRING = 'This style is not used';
  return Rule;
})(Lint.Rules.AbstractRule);
exports.Rule = Rule;
var NoUnusedStylesWalker = /** @class */ (function(_super) {
  __extends(NoUnusedStylesWalker, _super);
  function NoUnusedStylesWalker() {
    var _this = (_super !== null && _super.apply(this, arguments)) || this;
    _this.stylesheets = {};
    _this.usedProperties = {};
    return _this;
  }
  NoUnusedStylesWalker.prototype.visitVariableDeclaration = function(node) {
    var name = node.name,
      initializer = node.initializer;
    if (initializer && this.isStyleSheetInitializer(initializer)) {
      var firstArgument = initializer.arguments[0];
      if (firstArgument && ts.isObjectLiteralExpression(firstArgument)) {
        this.stylesheets[name.getText()] = firstArgument.properties;
      }
    }
    _super.prototype.visitVariableDeclaration.call(this, node);
  };
  NoUnusedStylesWalker.prototype.visitPropertyAccessExpression = function(node) {
    if (!this.usedProperties[node.expression.getText()]) {
      this.usedProperties[node.expression.getText()] = [];
    }
    this.usedProperties[node.expression.getText()].push(node.name.getText());
    _super.prototype.visitPropertyAccessExpression.call(this, node);
  };
  NoUnusedStylesWalker.prototype.visitEndOfFileToken = function(node) {
    var _this = this;
    Object.entries(this.stylesheets).forEach(function(_a) {
      var variableName = _a[0],
        stylesheet = _a[1];
      stylesheet.forEach(function(child) {
        if (
          ts.isPropertyAssignment(child) &&
          (!this.usedProperties[variableName] ||
            !this.usedProperties[variableName].includes(child.name.getText()))
        ) {
          _this.addFailure(
            _this.createFailure(child.getStart(), child.getWidth(), Rule.FAILURE_STRING),
          );
        }
      });
    });
    _super.prototype.visitEndOfFileToken.call(this, node);
  };
  NoUnusedStylesWalker.prototype.isStyleSheetInitializer = function(initializer) {
    return (
      ts.isCallExpression(initializer) &&
      initializer.expression &&
      ts.isPropertyAccessExpression(initializer.expression) &&
      initializer.expression.expression.getText() === 'StyleSheet' &&
      initializer.expression.name.getText() === 'create'
    );
  };
  return NoUnusedStylesWalker;
})(Lint.RuleWalker);
