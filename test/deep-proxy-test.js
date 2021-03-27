/*
	Nested Proxies

	Copyright (c) 2018 - 2021 Cédric Ronvel

	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;



const DeepProxy = require( '..' ) ;



describe( "Basic usage" , () => {

	it( "get and deep get without handler" , () => {
		var object = { a: 1 , deep: { c: 3 , deeper: { hello: "world!" } } , array: [ 1 , 2 , 3 ] } ;
		var proxy = new DeepProxy( object ) ;
		
		expect( proxy ).not.to.be( object ) ;
		expect( proxy.a ).to.be( 1 ) ;
		expect( proxy.deep ).not.to.be( object.deep ) ;
		expect( proxy.deep.c ).to.be( 3 ) ;
		expect( proxy.deep.deeper ).not.to.be( object.deep.deeper ) ;
		expect( proxy.deep.deeper.hello ).to.be( "world!" ) ;
		expect( proxy.array ).not.to.be( object.array ) ;
		expect( proxy.array[ 0 ] ).to.be( 1 ) ;
		expect( proxy.array[ 1 ] ).to.be( 2 ) ;
		expect( proxy.array[ 2 ] ).to.be( 3 ) ;
		expect( proxy.array.length ).to.be( 3 ) ;
		
		// check the deep proxy cache/weakmap
		expect( proxy.deep ).to.be( proxy.deep ) ;
		expect( proxy.array ).to.be( proxy.array ) ;
	} ) ;
	
	it( "simple set and deep set without handler" , () => {
		var object = { a: 1 , deep: { c: 3 , deeper: { hello: "world!" } } , array: [ 1 , 2 , 3 ] } ;
		var proxy = new DeepProxy( object ) ;
		
		proxy.a = 10 ;
		proxy.deep.c = 13 ;
		proxy.deep.deeper.hello = "w-o-r-l-d" ;
		proxy.array[ 1 ] = 20 ;
		expect( proxy.a ).to.be( 10 ) ;
		expect( proxy.deep.c ).to.be( 13 ) ;
		expect( proxy.deep.deeper.hello ).to.be( "w-o-r-l-d" ) ;
		expect( proxy.array[ 0 ] ).to.be( 1 ) ;
		expect( proxy.array[ 1 ] ).to.be( 20 ) ;
		expect( proxy.array[ 2 ] ).to.be( 3 ) ;
		expect( proxy.array.length ).to.be( 3 ) ;
		
		//console.log( object ) ;
	} ) ;
	
	it( "simple get, set, then get again (and deep) without handler" , () => {
		var object = { array: [ 1 , 2 , 3 ] , deep: { array: [ 4 , 5 , 6 ] } } ;
		var proxy = new DeepProxy( object ) ;
		
		expect( proxy.array ).to.equal( [ 1 , 2 , 3 ] ) ;
		proxy.array[ 0 ] = 'one' ;
		expect( proxy.array ).to.equal( [ 'one' , 2 , 3 ] ) ;
		proxy.array = [ 'one' , 'two' ] ;
		expect( proxy.array ).to.equal( [ 'one' , 'two' ] ) ;
		
		expect( proxy.deep.array ).to.equal( [ 4 , 5 , 6 ] ) ;
		proxy.deep.array[ 0 ] = 'three' ;
		expect( proxy.deep.array ).to.equal( [ 'three' , 5 , 6 ] ) ;
		proxy.deep.array = [ 'three' , 'four' ] ;
		expect( proxy.deep.array ).to.equal( [ 'three' , 'four' ] ) ;
	} ) ;
	
	it( "array .push() and deep .push() without handler" , () => {
		var array = [ 1 , 2 , 3 ] ;
		var proxy = new DeepProxy( array ) ;
		
		proxy.push( 40 ) ;
		expect( proxy[ 0 ] ).to.be( 1 ) ;
		expect( proxy[ 1 ] ).to.be( 2 ) ;
		expect( proxy[ 2 ] ).to.be( 3 ) ;
		expect( proxy[ 3 ] ).to.be( 40 ) ;
		expect( proxy.length ).to.be( 4 ) ;
		
		var object = { array: [ 1 , 2 , 3 ] } ;
		proxy = new DeepProxy( object ) ;
		
		proxy.array.push( 40 ) ;
		expect( proxy.array[ 0 ] ).to.be( 1 ) ;
		expect( proxy.array[ 1 ] ).to.be( 2 ) ;
		expect( proxy.array[ 2 ] ).to.be( 3 ) ;
		expect( proxy.array[ 3 ] ).to.be( 40 ) ;
		expect( proxy.array.length ).to.be( 4 ) ;
	} ) ;
	
	it( "array .splice() and deep .splice() without handler" , () => {
		var array = [ 4 , 5 , 6 , 7 , 8 ] ;
		var proxy = new DeepProxy( array ) ;
		
		proxy.splice( 2 , 2 ) ;
		expect( proxy ).to.be.like( [ 4 , 5 , 8 ] ) ;
		expect( proxy.length ).to.be( 3 ) ;
		
		var object = { array: [ 4 , 5 , 6 , 7 , 8 ] } ;
		proxy = new DeepProxy( object ) ;
		
		proxy.array.splice( 2 , 2 ) ;
		expect( proxy.array ).to.be.like( [ 4 , 5 , 8 ] ) ;
		expect( proxy.array.length ).to.be( 3 ) ;
	} ) ;
	
	it( "simple set and deep set with handler" , () => {
		var object = { a: 1 , deep: { c: 3 , deeper: { hello: "world!" } } , array: [ 1 , 2 , 3 ] } ;
		var proxy = new DeepProxy( object , {
			set: ( target , property , value , receiver , path ) => {
				if ( Array.isArray( target ) && property === 'length' ) {
					target.length = value ;
				}
				else {
					target[ property ] = path + ':' + value ;
				}
				
				return true ;
			}
		} ) ;
		
		proxy.a = 10 ;
		proxy.deep.c = 13 ;
		proxy.deep.deeper.hello = "w-o-r-l-d" ;
		proxy.array[ 1 ] = 20 ;
		
		expect( object.a ).to.be( "a:10" ) ;
		expect( object.deep.c ).to.be( "deep.c:13" ) ;
		expect( object.deep.deeper.hello ).to.be( "deep.deeper.hello:w-o-r-l-d" ) ;
		expect( object.array[ 0 ] ).to.be( 1 ) ;
		expect( object.array[ 1 ] ).to.be( "array[1]:20" ) ;
		expect( object.array[ 2 ] ).to.be( 3 ) ;
		expect( object.array.length ).to.be( 3 ) ;
		
		proxy.array.push( 40 ) ;
		expect( object.array[ 3 ] ).to.be( "array[3]:40" ) ;
		expect( object.array.length ).to.be( 4 ) ;
	} ) ;

	it( "'pathArray' mode" , () => {
		var object = { a: 1 , deep: { c: 3 , deeper: { hello: "world!" } } , array: [ 1 , 2 , 3 ] } ;
		var proxy = new DeepProxy(
			object ,
			{
				set: ( target , property , value , receiver , path ) => {
					if ( Array.isArray( target ) && property === 'length' ) {
						target.length = value ;
					}
					else {
						target[ property ] = path ;
						path.push( value ) ;
					}
					
					return true ;
				}
			} ,
			{
				pathArray: true
			}
		) ;
		
		proxy.a = 10 ;
		proxy.deep.c = 13 ;
		proxy.deep.deeper.hello = "w-o-r-l-d" ;
		proxy.array[ 1 ] = 20 ;
		
		expect( object.a ).to.equal( [ 'a' , 10 ] ) ;
		expect( object.deep.c ).to.equal( [ 'deep' , 'c' , 13 ] ) ;
		expect( object.deep.deeper.hello ).to.equal( [ 'deep' , 'deeper' , 'hello' , 'w-o-r-l-d' ] ) ;
		expect( object.array[ 0 ] ).to.be( 1 ) ;
		expect( object.array[ 1 ] ).to.equal( [ 'array' , 1 , 20 ] ) ;
		expect( object.array[ 2 ] ).to.be( 3 ) ;
		expect( object.array.length ).to.be( 3 ) ;
		
		proxy.array.push( 40 ) ;
		expect( object.array[ 3 ] ).to.equal( [ 'array' , 3 , 40 ] ) ;
		expect( object.array.length ).to.be( 4 ) ;
	} ) ;

	it( "test for ... in behavior" , () => {
		var object = { a: 1 , b: 2 , deep: { c: 3 , d: 4 } } ;
		var proxy = new DeepProxy( object ) ;
		
		var key , keys ; 
		
		keys = [] ;
		for ( key in proxy ) { keys.push( key ) ; }
		
		expect( keys ).to.equal( [ 'a' , 'b' , 'deep' ] ) ;
		
		keys = [] ;
		for ( key in proxy.deep ) { keys.push( key ) ; }
		
		expect( keys ).to.equal( [ 'c' , 'd' ] ) ;
	} ) ;
	
	it( "method call without handler" , () => {
		var v = 1 ;
		function inc() { return ++ v ; }
		var proxy = new DeepProxy( inc ) ;
		
		expect( proxy() ).to.be( 2 ) ;
		expect( v ).to.be( 2 ) ;
		
		expect( proxy() ).to.be( 3 ) ;
		expect( v ).to.be( 3 ) ;
	} ) ;
	
	it( "deep method call without handler" , () => {
		function inc() { return ++ this.v ; }
		
		var object = { v: 1 , inc , deep: { v: 3 , inc } } ;
		var proxy = new DeepProxy( object ) ;
		
		expect( proxy.v ).to.be( 1 ) ;
		expect( proxy.inc() ).to.be( 2 ) ;
		expect( proxy.v ).to.be( 2 ) ;
		
		expect( proxy.deep.v ).to.be( 3 ) ;
		expect( proxy.deep.inc() ).to.be( 4 ) ;
		expect( proxy.deep.v ).to.be( 4 ) ;
		
		expect( object ).to.partially.equal( { v: 2 , deep: { v: 4 } } ) ;
	} ) ;
	
	it( "method call with handler" , () => {
		var v = 1 , called = 0 ;
		function inc() { return ++ v ; }

		var proxy = new DeepProxy( inc , {
			apply: ( target , thisArg , args ) => {
				called ++ ;
				return target( ... args ) ;
			}
		} ) ;
		
		expect( proxy() ).to.be( 2 ) ;
		expect( v ).to.be( 2 ) ;
		expect( called ).to.be( 1 ) ;
		
		expect( proxy() ).to.be( 3 ) ;
		expect( v ).to.be( 3 ) ;
		expect( called ).to.be( 2 ) ;
	} ) ;

	it( "deep method call with handler" , () => {
		function inc() { return ++ this.v ; }
		
		var object = { v: 1 , called: 0 , inc , deep: { v: 3 , called: 0 , inc } } ;
		var proxy = new DeepProxy( object , {
			apply: ( target , thisArg , args ) => {
				thisArg.called ++ ;
				return target.call( thisArg , ... args ) ;
			}
		} ) ;
		
		expect( proxy.inc() ).to.be( 2 ) ;
		expect( proxy.deep.inc() ).to.be( 4 ) ;
		expect( object ).to.partially.equal( { v: 2 , called: 1 , deep: { v: 4 , called: 1 } } ) ;
	} ) ;
} ) ;



describe( "Behavior of the 'getLeaf' handler" , () => {

	it( "get and deep get with the 'getLeaf' handler" , () => {
		var object = { a: 1 , deep: { c: 3 , deeper: { hello: "world!" } } , array: [ 1 , 2 , 3 ] } ;
		
		var proxy = new DeepProxy( object , {
			getLeaf: ( target , property , receiver , path ) => {
				return path + ':' + target[ property ] ;
			}
		} ) ;
		
		expect( proxy ).not.to.be( object ) ;
		expect( proxy.a ).to.be( "a:1" ) ;
		expect( proxy.deep ).not.to.be( object.deep ) ;
		expect( proxy.deep.c ).to.be( "deep.c:3" ) ;
		expect( proxy.deep.deeper ).not.to.be( object.deep.deeper ) ;
		expect( proxy.deep.deeper.hello ).to.be( "deep.deeper.hello:world!" ) ;
		expect( proxy.array ).not.to.be( object.array ) ;
		expect( proxy.array[ 0 ] ).to.be( "array[0]:1" ) ;
		expect( proxy.array[ 1 ] ).to.be( "array[1]:2" ) ;
		expect( proxy.array[ 2 ] ).to.be( "array[2]:3" ) ;
		expect( proxy.array.length ).to.be( "array.length:3" ) ;
	} ) ;
} ) ;



describe( "Custom nested behavior" , () => {

	it( "get and deep get with the 'get' handler, exhibiting the handler context's 'this.nested()'" , () => {
		var object = { a: 1 , deep: { c: 3 , deeper: { hello: "world!" } } , array: [ 1 , 2 , 3 ] } ;
		
		var proxy = new DeepProxy( object , {
			get: function( target , property , receiver , path ) {
				if ( target[ property ] && typeof target[ property ] === 'object' ) {
					return this.nested( property ) ;
				}
				
				return path + ':' + target[ property ] ;
			}
		} ) ;
		
		expect( proxy ).not.to.be( object ) ;
		expect( proxy.a ).to.be( "a:1" ) ;
		expect( proxy.deep ).not.to.be( object.deep ) ;
		expect( proxy.deep.c ).to.be( "deep.c:3" ) ;
		expect( proxy.deep.deeper ).not.to.be( object.deep.deeper ) ;
		expect( proxy.deep.deeper.hello ).to.be( "deep.deeper.hello:world!" ) ;
		expect( proxy.array ).not.to.be( object.array ) ;
		expect( proxy.array[ 0 ] ).to.be( "array[0]:1" ) ;
		expect( proxy.array[ 1 ] ).to.be( "array[1]:2" ) ;
		expect( proxy.array[ 2 ] ).to.be( "array[2]:3" ) ;
		expect( proxy.array.length ).to.be( "array.length:3" ) ;
	} ) ;

	it( "custom data and recursive custom data" , () => {
		var object = { a: 1 , deep: { c: 3 , deeper: { hello: "world!" } } , array: [ 1 , 2 , 3 ] } ,
			data = { 'var': 'val' } ,
			rData = { a: 'A!' , deep: { c: 'C!' , deeper: { hello: "H!" } } , array: [ '0!' , '1!' , '2!' ] } ;
		
		var proxy = new DeepProxy(
			object ,
			{
				get: function( target , property , receiver , path ) {
					expect( this.data ).to.be( data ) ;

					if ( target[ property ] && typeof target[ property ] === 'object' ) {
						return this.nested( property , this.rData?.[ property ] ) ;
					}
					
					return path + ':' + this.data.var + ':' + this.rData?.[ property ] + ':' + target[ property ] ;
				}
			} ,
			{ data , rData }
			//{ data } , rData
		) ;
		
		expect( proxy ).not.to.be( object ) ;
		expect( proxy.a ).to.be( "a:val:A!:1" ) ;
		expect( proxy.deep ).not.to.be( object.deep ) ;
		expect( proxy.deep.c ).to.be( "deep.c:val:C!:3" ) ;
		expect( proxy.deep.deeper ).not.to.be( object.deep.deeper ) ;
		expect( proxy.deep.deeper.hello ).to.be( "deep.deeper.hello:val:H!:world!" ) ;
		expect( proxy.array ).not.to.be( object.array ) ;
		expect( proxy.array[ 0 ] ).to.be( "array[0]:val:0!:1" ) ;
		expect( proxy.array[ 1 ] ).to.be( "array[1]:val:1!:2" ) ;
		expect( proxy.array[ 2 ] ).to.be( "array[2]:val:2!:3" ) ;
		expect( proxy.array.length ).to.be( "array.length:val:3:3" ) ;
	} ) ;
	
	it( "nested's target override" ) ;
} ) ;

