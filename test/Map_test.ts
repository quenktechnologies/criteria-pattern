import * as must from 'must/register';
import * as help from './help';
import * as conditions from '../src/Map';

class Condition<A, B> extends conditions.Map<A, B> {

    name = help.string()
    age = help.number()
    roles = help.list()

}

class Nested<A, B> extends conditions.Map<A, B> {

    id = help.number()
    condition = new Condition()

}

const map = new Condition();
const nest = new Nested();

describe('Map', function() {

    describe('apply', function() {

        it('should return a Failure for invalid data', function() {

            must(map.apply({ name: null, age: '', roles: '' }).takeLeft()).
                be.instanceof(conditions.Failure);

        });

        it('should return valid data', function() {

            must(map.apply({ name: 'string', age: 22, roles: [] }).takeRight()).
                eql({ name: 'string', age: 22, roles: [] });

        });

        it('should run all preconditions', function() {

            must(map.apply({ name: 'string', age: 22 }).takeLeft()).be.instanceof(conditions.Failure);

        });

    });

});

describe('Nested', () => {

    it('should work', () => {

        must(nest.apply({ id: 12, condition: { name: 'string', age: 22, roles: [] } }).takeRight())
            .eql({ id: 12, condition: { name: 'string', age: 22, roles: [] } });

    })

    it('should detect errors', () => {

        must(
            nest.apply({
                id: 'six', condition: { name: new Date(), age: 22, roles: [] }
            }).takeLeft()
                .expand()).eql({ id: 'number', condition: { name: 'string' } });

    })

})

describe('Failure', function() {

    let fail;
    let templates: { [key: string]: string };

    beforeEach(function() {

        fail = new conditions.Failure('string', 12, { feels: 'joys' });
        templates = { string: 'Input "{$value}" is not a number! I no feel {feels}{punc}' };

    });

    describe('expand', function() {

        it('should expand templates', function() {

            must(fail.expand(templates, { punc: '!' }))
                .be('Input "12" is not a number! I no feel joys!');

        });

    });

});

describe('MapFailure', () => {

    describe('expand', () => {

        let fail;
        let templates: { [key: string]: string };

        beforeEach(function() {

            fail = new conditions.MapFailure<string | number | number[] | Date>({
                name: new conditions.Failure('string', new Date()),
                age: new conditions.Failure('range', 200, { min: 5, max: 122 }),
                size: new conditions.Failure('enum', 'small')
            }, { name: [3], age: 10000, size: 'tiny' });

            templates = {
                'name.string': 'There was a problem with {$key}!',
                'name': 'You should never see this',
                'age.range': '{$key} must be within {min} to {max}',
                'size': '{her} says size must not be {$value}'
            };

        });

        it('should work', () => {

            let r = fail.expand(templates, { her: 'Sara' });

            must(r).eql({
                name: 'There was a problem with name!',
                age: 'age must be within 5 to 122',
                size: 'Sara says size must not be small'
            });

        });

    });

});


