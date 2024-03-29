window.onload = function () {
	card.deck = card.slice();
	card.board = init();
	card.best = fire(card.board);
	card.best.row = card.best[0] < cols ? -1 : card.best[0] - cols;
	card.best.col = card.best[0] < cols ? card.best[0] : -1;
	card.best.hand = readBoard(card.board, p1.slice(), card.best.row, card.best.col);
	card.puzzle = [];
	card.candidates = new Array(rows * cols).hash();
	//labelTable();
}

var _ = '<br/>';

window.fire = function (board) {
	S = 5;

	//swapOut(card, [0,3]);

	displayPlayer(p1, 'player1', hide=true);
	displayBoard(board);

	var x = getBestLines(board, p1, streets.range);
	outlineHands(board, x);

	return x;
}

window.init = function (saved) {
	r1 = 25;
	r2 = 50;
	p1 = getHoleCards(r1);
	p2 = []//getHoleCards(r2);
	view = views[1||random(views.length)];
	cols = view.join(',').indexOf('10')/2 +1;
	rows = view.length/cols;
	board = getBoardCards();

	return board;
}

window.load = function () {
	var json = ~window.name.indexOf('save') ? eval(window.name.split('$')) : {save: window.last()};
	var saved = json.save;
	try {
		r1 = saved.r1;
		r2 = saved.r2;
		p1 = saved.p1;
		p2 = saved.p2;
		view = saved.view;
		cols = view.join(',').indexOf('10')/2 +1;
		rows = view.length/cols;
		board = saved.board;
	}
	finally {
	}

	return board;
}

window.last = function () {
	if (!window.view) view = views[1||random(views.length)];
	cols = view.join(',').indexOf('10')/2 +1;
	rows = view.length/cols;
	return {
		r1: window.r1||25,
		r2: window.r2||50,
		p1: window.p1||getHoleCards(window.r1||25),
		p2: window.p2||[]||getHoleCards(window.r2||50),
		view: window.view,
		board: window.board||getBoardCards()
	}
}

window.save = function (latest, combo) {
	if (latest || ~window.name.indexOf('save')) {
		var last = window.last();
		latest = '{';
		for (x in last) {
			latest += x + ':' + last[x] + ',';
		}
		latest = latest.slice(0,-2) + '}';
	}
}

window.clear = function () {
	window.name = '';
	window.save();
}

window.refresh = function () {
	window.location.replace('?');
}

window.onerror = function (a,b,c) {
	var callStack = [a + ':' + c];
	var args = arguments;
	while (args.callee.caller) {
		var line = args.callee.caller.toString().split('\r\n');
		callStack.push('\n' + line[0], '\n&nbsp; &nbsp; &nbsp;' + line[1]);
		args = args.callee.caller.arguments;
	}
	//console.log(callstack);
	//errors = document.getElementById('errors');
	//errors.innerHTML += callStack.join('<br/>') + '<br/>...<br/>';
	return true;
}

function outlineHands (board, index) {
	if (!index.length) index = [index];
	var d = document.getElementById(streets[S]);
	var table = d.getElementsByTagName('table')[0];

	for (var x=0; x < index.length; ++x) {
		if (index[x] < cols) {
			for (var i=0; i < rows; ++i) {
				if (table.rows[i].cells[index[x]].innerHTML)
					table.rows[i].cells[index[x]].className = 'outline';
			}
		}
		else {
			for (var i=0; i < cols; ++i) {
				if (table.rows[index[x]-cols].cells[i].innerHTML)
					table.rows[index[x]-cols].cells[i].className = 'outline';
			}
		}
	}
}

function displayPlayer (player, name, hide) {
	var d = document.getElementById(name);
	var table = document.createElement('table');

	var row = document.createElement('tr');
	var cell = document.createElement('td');
	cell.innerHTML = card[player[0]].split('').join(_);
	if (hide) {
		cell.setAttribute('class', 'hide');
	}
	else {
		card.seen[player[0]] = true;
	}
	row.appendChild(cell);

	var cell = document.createElement('td');
	cell.innerHTML = card[player[1]].split('').join(_);
	if (hide) {
		cell.setAttribute('class', 'hide');
	}
	else {
		card.seen[player[1]] = true;
	}
	row.appendChild(cell);

	table.appendChild(row);
	d.appendChild(table);
	//makeRounded(d.getElementsByTagName('table')[0]);
}

function displayBoard (board) {
	var d = document.getElementById(streets[S]);
	var table = document.createElement('table');

	var row = document.createElement('tr');
	var cell = document.createElement('td');

	for (var i=0, j=0; i < rows * cols; ++i) {
		if (i%cols==0) {
			row = document.createElement('tr');
			table.appendChild(row);
		}
		cell = document.createElement('td');
		row.appendChild(cell);
		if (view[i] <= S) {
			cell.innerHTML = card[board[i]].split('').join(_);
			if (/\@|\#/.test(card[board[i]])) cell.style.color = 'red';
			else cell.style.color = 'black';
			if (~board.space.indexOf(j++)) {
				cell.setAttribute('class', 'hide');
			} else {
				card.seen[board[i]] = true;
			}
		}
	}
	d.appendChild(table);
	
	jQuery('table table tr:nth(1)').css('padding-left', '100');
	//makeRounded(d.getElementsByTagName('table')[0]);
}

function labelTable() {
	var table = document.getElementsByTagName('table')[0];
	var label_table = document.createElement('table');
	label_table.setAttribute('id','LT');
	label_table.style.position = 'absolute';
	label_table.style.top = table.offsetTop;
	label_table.style.left = table.offsetLeft;
	label_table.style.width = table.offsetWidth;
	label_table.style.height = table.offsetHeight;
	for (var i=0; i < table.rows.length; ++i) {
		var row = document.createElement('tr');
		for (var j=0; j < table.rows[i].cells.length; ++j) {
			var cell = document.createElement('td');
			cell.colSpan = table.rows[i].cells[j].colSpan;
			cell.style.width = table.rows[i].cells[j].width;
			cell.style.height = table.rows[i].cells[j].offsetHeight;
			cell.style.textAlign = 'center';
			cell.style.verticalAlign = 'top';
			var div = document.createElement('div');
			div.style.position = 'relative';
			//if (i==2 && j==0) div.innerHTML = "Hole Cards";
			//if (i==1 && j==0) div.innerHTML = "The Board";
			//if (i==1 && j==2) div.innerHTML = "Should You...";
			//if (i==2 && j==0) div.innerHTML = "Opponents Range";
			cell.appendChild(div);
			row.appendChild(cell);
		}
		label_table.appendChild(row);
	}
	document.body.innerHTML += label_table.outerHTML;
}