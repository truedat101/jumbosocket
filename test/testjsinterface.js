/**
#
#Copyright (c) 2014 Razortooth Communications, LLC. All rights reserved.
#
#Redistribution and use in source and binary forms, with or without modification,
#are permitted provided that the following conditions are met:
#
#    * Redistributions of source code must retain the above copyright notice,
#      this list of conditions and the following disclaimer.
#
#    * Redistributions in binary form must reproduce the above copyright notice,
#      this list of conditions and the following disclaimer in the documentation
#      and/or other materials provided with the distribution.
#
#    * Neither the name of Razortooth Communications, LLC, nor the names of its
#      contributors may be used to endorse or promote products derived from this
#      software without specific prior written permission.
#
#THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
#ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
#WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
#DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
#ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
#(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
#LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
#ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
#(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
#SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
**/

var assert = require('assert');
var JS = require("../lib/js/js.js").JS;

var js = new JS();

// 
describe('JS.CONFIG defaults', function(){
	it('JS.CONFIG["DOCROOT"] should be not null, and set to default', function(){
		assert.equal(js.CONFIG['DOCROOT'], process.cwd() + "/static");
	});

	it('JS.CONFIG["HTTPWS_PORT"] should be not null, and set to 8000', function(){
		assert.equal(js.CONFIG['HTTPWS_PORT'], 8000);
	});

	it('JS.CONFIG["LISTEN_ON_ADDRESS"] should be not null, and set to local interface', function(){
		assert.notEqual(js.CONFIG['LISTEN_ON_ADDRESS'], null);
	});

	it('JS.CONFIG["VERSION_TAG"] should be set to the latest', function(){
		assert.equal(js.CONFIG['VERSION_TAG'], '0.1.16');
	});

	it('JS.CONFIG["VERSION_DESCRIPTION"] should be not null, and set to default', function(){
		assert.equal(js.CONFIG['VERSION_DESCRIPTION'], 'NPM package for Jumbosocket, affectionately known as JS.js');
	});
});
