import * as Ast from '../../src/ast';
import * as Interpreter from '../../src/interpreter';
import { MockListRandomProvider } from '../helpers';

describe('DiceInterpreter', () => {
  describe('evaluate', () => {
    it('evaluates successes (5d20>10).', () => {
      const exp = Ast.Factory.create(Ast.NodeType.Greater);

      const dice = Ast.Factory.create(Ast.NodeType.Dice);
      dice.addChild(Ast.Factory.create(Ast.NodeType.Number).setAttribute('value', 5));
      dice.addChild(Ast.Factory.create(Ast.NodeType.Number).setAttribute('value', 20));

      exp.addChild(dice);
      exp.addChild(Ast.Factory.create(Ast.NodeType.Number).setAttribute('value', 10));

      const mockList = new MockListRandomProvider();
      mockList.numbers.push(8, 12, 6, 20, 14);

      const interpreter = new Interpreter.DiceInterpreter(null, mockList);
      const errors: Interpreter.InterpreterError[] = [];
      interpreter.evaluate(exp, errors);

      const res = interpreter.countSuccesses(exp, false, 0, errors);

      expect(res).toBe(3);
    });
    it('evaluates successes with subtractFailures (5d10=10f).', () => {
      const exp = Ast.Factory.create(Ast.NodeType.SubtractFailure)
          .setAttribute('subtractFailure', true);

      const dice = Ast.Factory.create(Ast.NodeType.Dice);
      dice.addChild(Ast.Factory.create(Ast.NodeType.Number).setAttribute('value', 5));
      dice.addChild(Ast.Factory.create(Ast.NodeType.Number).setAttribute('value', 10));

      const equal = Ast.Factory.create(Ast.NodeType.Equal);
      equal.addChild(dice);
      equal.addChild(Ast.Factory.create(Ast.NodeType.Number).setAttribute('value', 10));

      exp.addChild(equal);

      const mockList = new MockListRandomProvider();
      mockList.numbers.push(8, 1, 6, 10, 10);

      const interpreter = new Interpreter.DiceInterpreter(null, mockList);
      const errors: Interpreter.InterpreterError[] = [];
      interpreter.evaluate(exp, errors);

      const fails = interpreter.countFailures(exp, true, errors);
      const res = interpreter.countSuccesses(exp, true, fails, errors);

      expect(res).toBe(1);
    });
    it('evaluates successes in a group {1d20, 1d20, 1d20}>10.', () => {
      const exp = Ast.Factory.create(Ast.NodeType.Greater);

      const dice = Ast.Factory.create(Ast.NodeType.Dice);
      dice.addChild(Ast.Factory.create(Ast.NodeType.Number).setAttribute('value', 1));
      dice.addChild(Ast.Factory.create(Ast.NodeType.Number).setAttribute('value', 20));

      const group = Ast.Factory.create(Ast.NodeType.Group);
      group.addChild(dice.copy());
      group.addChild(dice.copy());
      group.addChild(dice.copy());

      exp.addChild(group);
      exp.addChild(Ast.Factory.create(Ast.NodeType.Number).setAttribute('value', 10));

      const mockList = new MockListRandomProvider();
      mockList.numbers.push(8, 12, 20);

      const interpreter = new Interpreter.DiceInterpreter(null, mockList);
      const errors: Interpreter.InterpreterError[] = [];
      interpreter.evaluate(exp, errors);

      const res = interpreter.countSuccesses(exp, false, 0, errors);

      expect(res).toBe(2);
    });
  });
});
