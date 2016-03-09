const Q = require('q');
const wrap = require('../lib/wrap').default;
const events = require('../lib/events').default;
const Registry = require('../lib/registry').default;
const LayerTestObject = require('../lib/dev/layer-test-object').default;
const {ONE_HOUR} = require('../lib/constants');

describe("An unwrapped function", () => {

	afterEach(() => {
		Registry.clear();
		LayerTestObject.reset();
		events.removeAllListeners();
	});

	it("updates value and ceases events", done => {
		let i = 0;

		const handler = jasmine.createSpy('handler');

		events.on('time', handler);

		const A = wrap({
			ttl    : ONE_HOUR,
			layers : [LayerTestObject],
		}, function A() {
			return ++i;
		})

		// No arguments.
		const get = () => A()

		Q()
		.then(get)
		.then(v => expect(v).toBe(1))
		.then(() => expect(handler).toHaveBeenCalled())
		.then(() => handler.calls.reset())
		.then(get)
		.then(v => expect(v).toBe(1))
		.then(() => expect(handler).toHaveBeenCalled())
		.then(() => handler.calls.reset())
		.then(A.unwrap)
		.then(get)
		.then(v => expect(v).toBe(2))
		.then(() => expect(handler).not.toHaveBeenCalled())
		.then(done)
	});

	it("can be re-wrapped", done => {
		const handler = jasmine.createSpy('handler');

		events.on('time', handler);

		wrap({}, wrap({}, function A() {}).unwrap())().then(() => {
			expect(handler).toHaveBeenCalled();
			done();
		});
	});
});
