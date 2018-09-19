import * as must from 'must/register';
import { isString, matches, trim, gt, lt, range, notEmpty, toString } from '../src/string';
import { Failure } from '../src/result';

describe('string', function() {

    describe('isString', function() {

        it('should fail if the value specified is not a string', function() {

            must(isString('12').takeRight()).be('12');
            must(isString(12).takeLeft()).be.instanceOf(Failure);

        });

    });

    describe('matches', function() {

        it('should correctly test string', function() {

            let email = /.+\@.+\..+/;
            must(matches(email)('m12@emale.com').takeRight()).be('m12@emale.com');
            must(matches(email)('12').takeLeft()).be.instanceof(Failure);

        });

    });

    describe('trim', function() {

        it('should remove trailing whitespace', () => {

            must(trim(' ole o zebra       ').takeRight()).be('ole o zebra');

        });

    });

    describe('range', function() {

        it('should ensure a string length falls within a range', function() {

            let test = range(3, 5);

            must(test('1').takeLeft().explain()).be('range.min');
            must(test('111111').takeLeft().explain()).be('range.max');
            must(test('111').takeRight()).eql('111');
            must(test('1111').takeRight()).eql('1111');
            must(test('11111').takeRight()).eql('11111');

        })

    })

    describe('gt', function() {

        it('should ensure a string length is greater than', function() {

            let test = gt(5);

            must(test('1').takeLeft().explain()).be('gt');
            must(test('11111').takeLeft().explain()).be('gt');
            must(test('111111').takeRight()).be('111111');

        })

    })

    describe('lt', function() {

        it('should ensure a string length is less than', function() {

            let test = lt(5);

            must(test('1111111').takeLeft().explain()).be('lt');
            must(test('11111').takeLeft().explain()).be('lt');
            must(test('1111').takeRight()).be('1111');

        })

    })



    describe('notEmpty', () => {

        it('should work', () => {
            must(notEmpty('').takeLeft().explain()).be('notEmpty');
            must(notEmpty('[]').takeRight()).eql('[]');

        })

    });

    describe('toString', function() {

        it('should cast to string', () => {

            must(toString([12]).takeRight()).eql('12');

        })

    });

});
