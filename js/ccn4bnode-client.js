/**
#Created by David J. Kordsmeier on 2011-01-30.
#Copyright (c) 2011 Razortooth Communications, LLC. All rights reserved.
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

/* 
 * ccn4bnode-client.js
 * 
 * Setup all handlers specific to the CCN4BNODE.js demo
 * 
 **/
$(document).ready(function() {
	pingStatusInterval(); // Check server status every so often
	$('#ccn_stop').click(function() {
		console.log('ccn_stop');
		return false;
	});
	$('#ccn_start').click(function() {
		console.log('ccn_start');
		return false;
	});
	$('#ccn_restart').click(function() {
		console.log('ccn_restart');
		return false;
	});
});

function pingStatusInterval() {
	setInterval(function() {
		$.ajax({
			url: '/pingstatus',
			dataType: 'json',
			data: {},
			cache: false,
			success: pingStatusHandler,
			error: handleError
		});
	}, 10000);
}

function pingStatusHandler(data) {
	if (data) {
		if (data.status) {
			switch(data.status) {
				case 'stopped': {
					$('ccn_start').enable();
					$('ccn_stop').disable();
					$('ccn_restart').disable();
					break;
				} 
				case 'started': {
					$('ccn_start').disable();
					$('ccn_stop').enable();
					$('ccn_restart').enable();
					break;
				}
				case 'stopping': {
					$('ccn_start').enable();
					$('ccn_stop').disable();
					$('ccn_restart').disable();
					break;
				}
				case 'starting': {
					$('ccn_start').disable();
					$('ccn_stop').enable();
					$('ccn_restart').disable();
					break;
				}
				case 'restart': {
					$('ccn_start').disable();
					$('ccn_stop').enable();
					$('ccn_restart').disable();
					break;
				}
				default: {
					console.log('Status Unknown');
				}
			}
		}
	} else {
		
	}
}

function handleError(jqXHR, textStatus, errorThrown) {
	
}
