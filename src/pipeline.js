/* The MIT License (MIT)
 *
 * Copyright (c) 2016 Chaabane Jalal

 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const defer = require('./async').defer;

/**
 * @desc create a new pipeline with the function passed in parameters
 * @returns {function()}
 */
const pipeline = function() {

    const fns = arguments;

    if (fns.length === 0) {
        throw new Error("Empty pipeline is not a defined behavior");
    }

    /**
     * @desc Execute the next function with the given parameter
     * @param result
     * @param pos
     * @param future
     * @private
     */
    const _executeNext = (result, pos, future) => {
        if (pos >= fns.length) {
            future.resolve(result);
        } else if (result && result.then) {
            result.then((value) => _executeNext(fns[pos](value), pos + 1, future))
                  .catch(future.reject);
        } else {
            defer(() => {
                try {
                    _executeNext(fns[pos](result), pos + 1, future);
                }
                catch(err) {
                    future.reject(err);
                }
            });
        }
    };

    return (param) => {
        return new Promise((resolve, reject) => {
            _executeNext(fns[0].apply(null, [param]), 1, {resolve, reject});
        });
    };
};

module.exports = pipeline;