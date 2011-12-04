
function getBestLines(board, player, range) {
	if (!range) range = [0,cols];
	var index = [];
	
	for (var i=1; i < range.length; ++i) {
		var begin = range[i-1];
		var end = range[i];
		var street = end - begin;
		
		var h = testBoard(board, player, begin, end);
		var x = bestHand(h);

		index.push((x%street + begin) + (x-street>-1 ? cols : 0));
	}

	return (arguments.length < 3) ? index[0] : index;
}

function getRandomLines(range) {
	if (!range) range = [0,cols];
	var index = [];
	
	for (var i=1; i < range.length; ++i) {
		var begin = range[i-1];
		var end = range[i];
		var street = end - begin;

		index.push((random(street) + begin) + (random(2)<<0 ? cols : 0));
	}

	return index;
}

function getHoleCards (range) {
	var hole = [];

	while (!hole[0] && !hole[1]) {
		var rnd = random(rankings.length*range/100);
		hole.hand = rankings[rnd%rankings.length].toString();
		hole.suit1 = random(4);

		if (hole.hand.charAt(2) == 's') hole.suit2 = hole.suit1;
		else while ((hole.suit2 = random(4)) == hole.suit1);

		var o1 = hole.suit1*13 + rank[hole.hand.charAt(0)];
		var a1 = card.deck.join(',').indexOf(card[o1])/3;
		if (!card.used[o1]) {
			hole[0] = o1;
			card.used[o1] = true;
			card.deck.splice(a1,1);
		}
		else {
			hole = [];
			continue;
		}
		
		var o2 = hole.suit2*13 + rank[hole.hand.charAt(1)];
		var a2 = card.deck.join(',').indexOf(card[o2])/3;
		if (!card.used[o2]) {
			hole[1] = o2;
			card.used[o2] = true;
			card.deck.splice(a2,1);
		}
		else {
			hole = [];
			card.used[o1] = false;
			card.deck.push(card[o1]);
			continue;
		}
	}

	return hole;
}

function inLines (index, lines) {
	for (var i=0; i < lines.length; ++i) {
		if (lines[i] >= cols) {
			if (index / cols << 0 == lines[i] - cols) return true;
		} else {
			if (index % cols == lines[i]) return true;
		}
	}
	return false;
}

function getBoardCards () {
	while (true) {
		var board = [];
		var deck = card.deck.slice();
		var used = card.used.slice();
		var c = {deck: deck, used: used};
	
		for (var i=0; i < rows * cols; ++i) {
			if (view[i] > 7) board[i] = -1;
			else {
				var b = random(deck.length);
				board[i] = card[deck[b]];
				used[card[deck[b]]] = true;
				deck.splice(b,1);
			}
		}

		board.bestLines = getBestLines(board, p1, streets.range);
		board.candidates = [];
		board.path = [];
		board.space = [];
		board.fill = [];

		for (var i=0; i < rows * cols; ++i) {
			if (board[i] == -1) continue;
			if (!inLines(i, board.bestLines)) {
				putCard(board, i, c);
				board[i] = -2;
			}
		}
		getCandidates(board);
		findPuzzle(board);
		fillPuzzle(board);
		
		if (board.space.length > 12) break;
	}
		
	return board;
}

function getCandidates (board) {
	var candidates = board.candidates;
	for (var i=0; i < rows * cols; ++i) {
		if (board[i] == -1) continue;
		if (board[i] != -2) candidates.push([board[i]]);
		else {
			var a = [];
			var c = {deck: card.deck.slice(), used: card.used.slice()};
			for (var j=0; j < c.deck.length; ++j) {
				var b = useCard(board, i, c);
				var x = getBestLines(board, p1, streets.range);
				if (x.toString() == board.bestLines.toString()) {
					a.push(b);
				}
			}
			candidates.push(a);
			putCard(board, i, c);
		}
	}
	
	for (var i=0; i < candidates.length; ++i) {
		if (candidates[i].length > 1) continue;
		for (var k=0; k < candidates.length; ++k) {
			if (k==i) continue;
			var v = candidates[k].indexOf(candidates[i][0]);
			if (~v) candidates[k].splice(v, 1);
		}
	}

}

function findPuzzle(board) {
	var candidates = board.candidates;
	var path = board.path;
	var count = 0;
	findPath([], 0);
	
	function findPath (a, i) {
		if (i == candidates.length) return true;
		console.log([i,a.join(',')]);
		if (!(++count % 20000)) return;
		
		if (a[i] != undefined) {
			var v = path.indexOf(candidates[i][a[i]]);
			if (!~v) {
				path[i] = candidates[i][a[i]];
				if (findPath(a, i+1)) {
					return true;
				}
			}
		}
		
		for (a[i]=0; a[i] < candidates[i].length; ++a[i]) {
			var v = path.indexOf(candidates[i][a[i]]);
			if (!~v) {
				path[i] = candidates[i][a[i]];
				if (findPath(a, i+1)) {
					return true;
				}
			}
		}
		
		a[i] = random(candidates[i].length);
		var v = path.indexOf(candidates[i][a[i]]);
		if (v==-1 || v==i) {
			return false;
		} else {
			return findPath(a, v);
		}
	}
	
}

function findPuzzle2(board) {
	var candidates = board.candidates;
	var path = board.path;
	var space = board.space, fill = board.fill;
	
	for (var i=0; i < rows * cols; ++i) {
		if (board[i] == -1) continue;
		if (inLines(i, board.bestLines)) {
			putCard(board, i, c);
			board[i] = -2;
			getCandidates(board);
		}
	}

}

function fillPuzzle(board) {
	var candidates = board.candidates;
	var path = board.path;
	var space = board.space, fill = board.fill;
	
	loop: while (true) {
		for (var i=0; i < candidates.length; ++i) {
			if (candidates[i].length > 1) continue;
			if (!(~space.indexOf(i) || ~fill.indexOf(i))) space.push(i);
			for (var k=0; k < candidates.length; ++k) {
				if (k==i) continue;
				var v = candidates[k].indexOf(path[i]);
				if (~v) candidates[k].splice(v, 1);
			}
		}
		
		for (var i=0; i < candidates.length; ++i) {
			if (~space.indexOf(i) || ~fill.indexOf(i)) continue;
			if (candidates[i].length == 1) continue loop;
		}		
		
		for (var h=2; h < 52; ++h) {
			for (var i=0; i < candidates.length; ++i) {
				if (~space.indexOf(i) || ~fill.indexOf(i)) continue;
				if (candidates[i].length == h) {
					for (var j=0; j < candidates[i].length; ++j) {
						for (var k=0; k < candidates.length; ++k) {
							if (k==i) continue;
							var v = candidates[k].indexOf(path[i]);
							if (~v) candidates[k].splice(v, 1);
							if (path[k] == candidates[i][j]) {
								fill.push(k);
								candidates[k] = [path[k]];
							}
						}
					}
					space.push(i);
					candidates[i] = [path[i]];
					continue loop;
				}
			}
		}
		
		break loop;
	} 
		
	for (var i=0, j=0; i < rows * cols; ++i) {
		if (board[i] == -1) continue;
		else {
			board[i] = card[card[path[j]]];
			board[i].hide = ~board.space.indexOf(j);
			++j;
		}
	}
	
}

function useCard (board, i, c) {
	var c = c || card;
	var b = random(c.deck.length);
	var x = c.deck[b];
	board[i] = x;
	c.used[x] = true;
	c.deck.splice(b,1);
	return card[x];
}

function putCard (board, i, c) {
	var c = c || card;
	var b = c[board[i]];
	board[i] = -2 // ?;
	c.used[card[b]] = false;
	c.deck.push(b);
	return b;
}

function newCard (board, i, c) {
	putCard(board, i, c);
	return useCard(board, i, c);
}

function releaseCards () {
	for (var i=0; i < arguments.length; ++i) {
		card[arguments[i]].used = false;
	}
}

function randomSuit (c, x) {
	var suits = [];
	if (!card.seen[c%13 + 0*13]) suits.push(0);
	if (!card.seen[c%13 + 1*13]) suits.push(1);
	if (!card.seen[c%13 + 2*13]) suits.push(2);
	if (!card.seen[c%13 + 3*13]) suits.push(3);
	if (!suits.length) suits.push(random(4));
	
	return suits[random(suits.length)];
}

function readBoard (board, hand, r, c) {	
	for (var i=0; i < board.length; ++i) {
		if (~r && i/cols << 0 == r) {
			if (board[i] >= 0) hand.push(board[i]);
		}
		if (~c && i%cols << 0 == c) {
			if (board[i] >= 0) hand.push(board[i]);
		}
	}
	return hand;
}

function testBoard (board, player, begin, end) {
	var hands = [];

	for (var i=begin; i < end; ++i) {
		h = hands.push((player).slice())-1;
		hands[h] = readBoard(board, hands[h], -1, i);
		hands[h].test();
	}

	for (var i=begin; i < end; ++i) {
		h = hands.push((player).slice())-1;
		hands[h] = readBoard(board, hands[h], i, -1);
		hands[h].test();
	}
	return hands;
}

function bestHand (h) {
	var value = h[0].value;
	var kicker = h[0].kicker;
	var longest = h[0].length;
	var x = 0;

	for (var i=1; i < h.length; ++i) {
		best = false;
		if (h[i].value > value) best = true;
		else if (h[i].value == value) {
			if (test = h[i].kick(kicker)) best = true;
			else if (test == null) {
				if (h[i].length > longest) best = true;
			}
		}
		if (best) {
			value = h[i].value;
			kicker = h[i].kicker;
			longest = h[i].length < H ? h[i].length : H;
			x = i;
		}
	}
	return x;
}

function displayUnknowns () {
	var d = document.getElementById(streets[S]);
	var table = d.childNodes[0];
	
	for (var i=0; i < table.cells.length; ++i) {
		if (view[i] == 8) table.cells[i].innerHTML = '??';
		makeRounded(d.childNodes[0]);
	}
}

function removeExtras (card, target) {
	var trial = card.board.slice();
	var tried = card.candidates.slice();
	var candidates = [];
	
	var puzzle = card.puzzle.slice();
	var deck = card.deck.slice();
	if (!card.backup) card.backup = card.board.slice();
	var stop = false;

	var i=0;
	search: while (tried.length) {
		t = tried.splice(random(tried.length),1)[0];
		if (!~trial[t]) continue search;
		i++;
		
		puzzle.push(t);
		trial[t] = deck.push(trial[t]) && -1;
		var temp = p1.slice().concat(deck);
		var combo = new Array(temp.length).hash();
		if (candidates.length + tried.length < target) break search;
		
		while (c = combo.yieldPermutation()) {
			if (c[0] > c[1] || c[c.length-1] == c.length-1) continue;
			var pt = [temp[c[0]], temp[c[1]]];
			var at = trial.slice();
			for (var j=0; j < puzzle.length; ++j) {
				at[puzzle[j]] = temp[c[j+2]];
			}
			var x = getBestLines(at, pt, streets.range);
			if (x.toString() == card.best.toString()) {
				puzzle.pop();
				trial[t] = deck.pop();
				continue search;
			}
		}

		candidates.push(puzzle.pop());
		trial[t] = deck.pop();
	}
	
	if (!candidates) alert('bad');
	return candidates;
}

window.child = {window: []};
function multiThread(func, count, ret) {
	var iframe = document.createElement('iframe');
	iframe.src = 'subpage.html';
	document.body.appendChild(iframe);
}

function makePuzzle (card) {
	var d = document.getElementById(streets[S]);
	var table = d.childNodes[0];
	
	for (var i=0; i < card.candidates.length; ++i) {
		if (!~card.board[card.candidates[i]]) card.candidates.splice(i--,1);
		//else if (~table.cells[card.candidates[i]].className.indexOf('outline')) card.candidates.splice(i--,1);
	}
	
	card.candidates = removeExtras(card);	
	var candidates = card.candidates.slice();
	if (makePuzzle.candidates) {
		makePuzzle.candidates = card.candidates;
	}
	else {
		cc = [];
		var target = tt = 0;
		var bernoulliTrials = candidates.length*1/Math.E/2//fudge;
		for (var i=0; i < candidates.length; ++i) {
			card.puzzle.push(candidates[i]);
			card.deck.push(card.board[candidates[i]]);
			card.candidates = removeExtras(card, tt);
			cc[i] = card.candidates.slice();
			cc[-candidates[i]] = card.candidates.slice();
			card.puzzle.pop();
			card.deck.pop();
			card.candidates = candidates.slice();
			var tt = cc.max().length;
			if (i < bernoulliTrials) target = [target, tt].max();
			else if (tt > target) {
				for (i++; i < candidates.length; ++i) {
					cc[i] = [candidates[i]];
					cc[-candidates[i]] = candidates[i];
				}
				break;
			}
		}

		ccSorted = cc.slice().sort(byLength);

		makePuzzle.candidates = [];
		for (var i=0; i < ccSorted.length; ++i) {
			for (var j=0; j < ccSorted[0].length; ++j) {
				if (ccSorted[i].toString() == cc[-ccSorted[0][j]].toString()) {
					makePuzzle.candidates.push(ccSorted[0][j]);
					break;
				}
			}
		}
	}

	var t = makePuzzle.candidates.shift();
	card.puzzle.push(t);
	card.deck.push(card.board[t]);
	
	for (var i=0; i < card.puzzle.length; ++i) {
		if (!table.cells[card.puzzle[i]]) return;
		var outlined = ~table.cells[card.puzzle[i]].className.indexOf('outline');
		if (table) table.cells[card.puzzle[i]].className = outlined ? 'outline-hide' : 'hide';
	}
	
	//setTimeout(function() {makePuzzle(card)}, 1);
	
}

function releaseExtras(card) {
	var d = document.getElementById(streets[S]);
	var table = d.childNodes[0];
	for (var i=0; i < card.puzzle.length; ++i) {
		card.board[card.puzzle[i]] = card.backup[card.puzzle[i]];
		var outlined = ~table.cells[card.puzzle[i]].className.indexOf('outline');
		if (table) table.cells[card.puzzle[i]].className = outlined ? 'outline' : '';
	}
	card.puzzle = [];
	card.deck = [];
}
