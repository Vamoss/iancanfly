Math.clamp = function ( value, min, max ) {
	return Math.max( min, Math.min( max, value ) );
}

Math.map = function ( x, a1, a2, b1, b2 ) {
	return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );
}