
Array.prototype.hash = function () {
	for (var i=0; i < this.length; ++i) this[this[i]||i] = i; 
	return this;
}

Array.prototype.random = function (clear) {
	var r = this.length * Math.random() << 0;
	var n = this[r];
	if (clear) this.splice(r,1);
	return n;
}

Array.prototype.expand = function () {
	for (var i=0; i < this.length; ++i) {
		if (typeof this[i] == 'object') {
			this.splice.apply(this, [i,1].concat(this[i].expand()))
		}
	}
	return this;
}

Array.prototype.min = function (threshold) {
	if (threshold == undefined) threshold = -1;
	var m = 0;
	if (threshold != undefined) for (var m=0; m < this.length; ++m) if (this[m].length > threshold) break;
	if (!this.length) return m;
	if (~this[0].length) for (var i=0; i < this.length; ++i) {
		if (this[i] == undefined) continue; 
		if (this[i].length < this[m].length && this[i].length > threshold) m = i;
	}
	else for (var i=0; i < this.length; ++i) {
		if (this[i] == undefined) continue; 
		if (this[i] < this[m] && this[i].length > threshold) m = i;
	}
	this._min = m;
	return this[m];
}

Array.prototype.max = function () {
	var m = 0;
	if (!this.length) return m;
	if (~this[0].length) {for (var i=0; i < this.length; ++i) if (this[i].length > this[m].length) m = i;}
	else {for (var i=0; i < this.length; ++i) if (this[i] > this[m]) m = i;}
	this._max = m;
	return this[m];
}

Array.prototype.combinations = function () {
	if (this.length == 1) return this;
	var combo = [];
	for (var i=0; i < this.length; ++i) {
		var block = this.slice();
		var prefix = [block.splice(i,1)];
		var suffix = block.combinations();
		for (var j=0; j < suffix.length; ++j) {
			combo.push(prefix.concat(suffix[j]).expand());
		}
	}
	return combo;
}

Array.combo = [
	[[0,1],[1,0]],
	[[2,0,1],[0,2,1],[0,1,2],[2,1,0],[1,2,0],[1,0,2]]
];

Array.prototype.permutations = function () {
	//if (Array.combo[this.length-2]) return Array.combo[this.length-2].slice();
	var combo = [];
	var pre_combo = Array.combo[this.length-3];
	for (var i=0; i < pre_combo.length; ++i) {
		for (var j=0; j < this.length; ++j) {
			var c = pre_combo[i].slice();
			c.splice(j,0,this.length-1);
			combo.push(c);
		}
	}
	Array.combo[this.length-2] = combo;
	return combo.slice();
}

Array.prototype.yieldPermutation = function () {
	var x = (this.i|=0) * (this.length) + (this.j|=0);
	var combo = Array.combo[this.length-2] = Array.combo[this.length-2]||[];
	var pre_combo = Array.combo[this.length-3]||[];

	if (combo && combo[x]) {
		if (this.j < this.length) ++this.j;
		else (++this.i, this.j=1);
		return combo[x].slice();
	}
	
	for (var i = this.i; i < pre_combo.length; ++i) {
		for (var j = this.j; j < this.length; ++j) {
			combo[x] = pre_combo[i].slice();
			combo[x].splice(j,0,this.length-1);
			++this.j;
			break;
		}
		if (this.j >= this.length) ++this.i, this.j=0;
		if (!combo[x]) return null;
		return combo[x].slice();
	}
	return null;
}

Array.lehmer = [
	['0'],
	['00', '10'],
	['000','010','100','110','200','210']
];

Array.prototype.permutations = function () {
	//lehmer permutations
	if (Array.lehmer[this.length-1]) return Array.lehmer[this.length-1].slice();
	var combo = [];
	var pre_combo = Array.lehmer[this.length-2].toString();
	for (var i=0; i < this.length; ++i) {
		combo.push.apply(this, pre_combo.replace(/^|,/, i).split(','));
	}
	Array.combo[this.length-1] = combo;
	return combo.slice();
}

Array.prototype.yieldPermutation = function () {
	//lehmer permutations
	var array = this.permutations();

	this.x |= 0;

	if (++x == array.length) return this.x = null;
	else {
		var combo = array[x-1].split('');
		var temp = [];
		var self = this.slice();
		while (combo.length) {
			temp.push(self.splice(combo.shift(),1)[0]);
		}
		return temp;
	}
}

//javascript:a = [0,1,2,3]; for (var n=0; n < 19; ++n) {alert(a.yieldPermutation())}; void(0);

byRank = function(a,b){return a%13 - b%13};
bySuit = function(a,b){return a/13 - b/13};
byLength = function(a,b){return b.length - a.length};

random = function (n) {return n * Math.random() << 0};
digit$ = '0123456789';

Hand = [].constructor;
H = 5;
var debug = false;
Hand.prototype.flush = function () {
	var hand = this.slice().expand().sort(byRank);
	var resp = [[],[],[],[]];
	for (var i=0; i < hand.length; ++i) {
		if (debug) alert([i,'$',hand[i],'$',hand[i]/13,'$',hand[i]/13 << 0,'$',resp[hand[i]/13 << 0]]);
		resp[hand[i]/13 << 0].push(hand[i]);
	}
	return resp.sort(byLength);
}

Hand.prototype.match = function () {
	var hand = this.slice().expand().sort(byRank);
	var resp = [[],[],[],[],[],[],[],[],[],[],[],[],[]];
	for (var i=0; i < hand.length; ++i) {
		resp[hand[i]%13 << 0].push(hand[i]);
	}
	return resp.sort(byLength);
}

Hand.prototype.strait = function () {
	var hand = this.slice().expand().sort(byRank);
	var resp = [[],[],[],[],[],[],[],[],[],[]];
	for (var i=0; i < hand.length; ++i) {
		for (var j=0; j < 13-H+1; ++j) {
			if ((hand[i]%13 >= j && hand[i]%13 < j+H) ||
				(hand[i]%13==0 && j==13-H)) {
				for (var k=0; k < resp[j].length; ++k) {
					if (hand[i]%13 == resp[j][k]%13) break;
				}
				if (k == resp[j].length) resp[j].push(hand[i]);
			}
		}
	}
	return resp.sort(byLength);
}

Hand.prototype.kick = function (k) {
	if (!this._flush || !this._strait || !this._match) this.test();
	for (var i=0; i < k.length && i < this.kicker.length; ++i) {
		if (k[i]%13 > this.kicker[i]%13) return true;
		if (k[i]%13 < this.kicker[i]%13) return false;
	}
	return null;
}

Hand.prototype.test = function () {
	this._flush = this.flush();
	this._strait = this.strait();
	this._match = this.match();
	switch (true) {
		case (this._match[0].length >= 5):
			this.value = 9;
			(this.kicker = this._match[0].slice(0,5));
			break;
		case (this._strait[0].length >= 5 && this._flush[0].length >= 5):
			this.value = 8;
			(this.kicker = this._strait[0].slice(0,5));
			break;
		case (this._match[0].length >= 4):
			this.value = 7;
			(this.kicker = this._match[0].slice(0,4)).push(this._match[1][0]);
			break;
		case (this._match[0].length >= 3 && this._match[1].length >= 2):
			this.value = 6;
			(this.kicker = this._match[0].slice(0,3)).push(this._match[1][0],this._match[1][1]);
			break;
		case (this._flush[0].length >= 5):
			this.value = 5;
			(this.kicker = this._flush[0].slice(0,5));
			break;
		case (this._strait[0].length >= 5):
			this.value = 4;
			(this.kicker = this._strait[0].slice(0,5));
			break;
		case (this._match[0].length >= 3):
			this.value = 3;
			(this.kicker = this._match[0].slice(0,3)).push(this._match[1][0],this._match[2][0]);
			break;
		case (this._match[0].length >= 2 && this._match[1].length >= 2):
			this.value = 2;
			(this.kicker = this._match[0].slice(0,2)).push(this._match[1][0],this._match[1][1],this._match[2][0]);
			break;
		case (this._match[0].length >= 2):
			this.value = 1;
			(this.kicker = this._match[0].slice(0,2)).push(this._match[1][0],this._match[2][0],this._match[3][0]);
			break;
		default:
			this.value = 0;
			(this.kicker = this._match[0].slice(0,1)).push(this._match[1][0],this._match[2][0],this._match[3][0],this._match[4][0]);
			break;
	}
	this.large = Math.max(this._flush[0].length, this._strait[0].length, this._match[0].length);
	this.score = this._flush[0].length + this._strait[0].length + this._match[0].length;
	this.scorest = Math.max(this._match[0].length*6/3, this._flush[0].length*5/3, this._strait[0].length*4/3);
	return this.value;
}

rank = ['A','K','Q','J','T','9','8','7','6','5','4','3','2'].hash();
suit = ['s','h','d','c'].hash();
streets = ['','','','flop','turn','river'].hash();
streets.range = [0,3,7,12];


card = ['A$', 'K$', 'Q$', 'J$', 'T$', '9$', '8$', '7$', '6$', '5$', '4$', '3$', '2$',
	'A#', 'K#', 'Q#', 'J#', 'T#', '9#', '8#', '7#', '6#', '5#', '4#', '3#', '2#',
	'A@', 'K@', 'Q@', 'J@', 'T@', '9@', '8@', '7@', '6@', '5@', '4@', '3@', '2@',
	'A!', 'K!', 'Q!', 'J!', 'T!', '9!', '8!', '7!', '6!', '5!', '4!', '3!', '2!'].hash();
card[-1] = '';
card[-2] = '??';
card.used = [];
card.seen = [];

rankings = [	'AA','KK','QQ','JJ','AKs','AQs','TT','AK','AJs','KQs','99','ATs','AQ',
		'KJs','88','QJs','KTs','A9s','AJ','QTs','KQ','77','JTs','A8s','K9s','AT',
		'A5s','A7s','KJ','66','T9s','A4s','Q9s','J9s','QJ','A6s','55','A3s','K8s',
		'KT','98s','T8s','K7s','A2s','87s','QT','Q8s','44','A9','J8s','76s','JT',
		'97s','K6s','K5s','K4s','T7s','Q7s','K9','65s','T9','86s','A8','J7s','33',
		'54s','Q6s','K3s','Q9','75s','22','J9','64s','Q5s','K2s','96s','Q3s','J8',
		'98','T8','97','A7','T7','Q4s','Q8','J5s','T6','75','J4s','74s','K8',
		'86','53s','K7','63s','J6s','85','T6s','76','A6','T2','95s','84','62',
		'T5s','95','A5','Q7','T5','87','83','65','Q2s','94','74','54','A4',
		'T4','82','64','42','J7','93','85s','73','53','T3','63','K6','J6',
		'96','92','72','52','Q4','K5','J5','43s','Q3','43','K4','J4','T4s',
		'Q6','Q2','J3s','J3','T3s','A3','Q5','J2','84s','82s','42s','93s','73s',
		'K3','J2s','92s','52s','K2','T2s','62s','32','A2','83s','94s','72s','32s'
];

$ = 10;
views = [[
	5,5,5,5,5,9,9,9,9,$,
	5,5,5,5,5,9,9,9,9,9,
	5,5,5,5,5,9,9,9,9,9,
	5,5,5,5,5,9,9,9,9,9,
	5,5,5,5,5,9,9,9,9,9,
	9,9,9,9,9,5,5,5,5,5,
	9,9,9,9,9,5,5,5,5,5,
	9,9,9,9,9,5,5,5,5,5,
	9,9,9,9,9,5,5,5,5,5,
	9,9,9,9,9,5,5,5,5,5
],[
	5,5,5,9,9,9,9,9,9,9,9,$,
	5,5,5,9,9,9,9,9,9,9,9,9,
	5,5,5,9,9,9,9,9,9,9,9,9,
	9,9,9,5,5,5,5,9,9,9,9,9,
	9,9,9,5,5,5,5,9,9,9,9,9,
	9,9,9,5,5,5,5,9,9,9,9,9,
	9,9,9,5,5,5,5,9,9,9,9,9,
	9,9,9,9,9,9,9,5,5,5,5,5,
	9,9,9,9,9,9,9,5,5,5,5,5,
	9,9,9,9,9,9,9,5,5,5,5,5,
	9,9,9,9,9,9,9,5,5,5,5,5,
	9,9,9,9,9,9,9,5,5,5,5,5
]];
