// thaw-reversi-web-app/script.js

'use strict';

var nNumDirections = 8;
var adx = [-1, 0, 1, -1, 1, -1, 0, 1];          // adx.length == nNumDirections
var ady = [-1, -1, -1, 0, 0, 1, 1, 1];          // ady.length == nNumDirections

const nBoardWidth = 8;
const nBoardHeight = 8;
const nBoardArea = nBoardWidth * nBoardHeight;
var aBoardImageNumbers = null;  // new Array(nBoardArea);

var EmptyNumber = -1;

var PiecePopulations = [0, 0];

// **** Function Declarations ****

function getSquareState(row, col) {

    if (row < 0 || row >= nBoardHeight || col < 0 || col >= nBoardWidth) {
        return EmptyNumber;
    }

    return aBoardImageNumbers[row * nBoardWidth + col];
}

function setSquareState(row, col, imageNumber, visible) {

    if (row < 0 || row >= nBoardHeight || col < 0 || col >= nBoardWidth) {
        return;
    }

    var i = row * nBoardWidth + col;

    aBoardImageNumbers[i] = imageNumber;

    if (visible) {
        $("[name='squares']").eq(i).prop("src", getImagePath(imageNumber));
    }
}

function isGameNotOver () {
	// TODO: If neither player can make a legal move, the game is over.
	// TODO: Let the game engine (thaw-reversi-engine) determine from the board alone whether or not neither player can move.
    return PiecePopulations[0] > 0 &&
        PiecePopulations[1] > 0 &&
        PiecePopulations[0] + PiecePopulations[1] < nBoardArea &&
        noAutomatedMovePossible < 2;
}

function squareScore(nRow, nCol) {
    var cornerSquareScore = 8;
    var edgeSquareScore = 2;
    var nScore = 1;
    var isInEdgeColumn = nCol == 0 || nCol == nBoardWidth - 1;

    if (nRow == 0 || nRow == nBoardHeight - 1) {

        if (isInEdgeColumn) {
            nScore = cornerSquareScore;
        } else {
            nScore = edgeSquareScore;
        }
    } else if (isInEdgeColumn) {
        nScore = edgeSquareScore;
    }

    return nScore;
}

function PlacePieceData() {
    this.numPiecesFlipped = 0;
    this.score = 0;
}

function placePiece(nPlayer, nRow, nCol, undoBuffer, visible) {
    var returnObject = new PlacePieceData();
    var nUndoSize = 0;
    var nScore = 0;

    if (nRow < 0 || nRow >= nBoardHeight ||
		nCol < 0 || nCol >= nBoardWidth ||
		getSquareState(nRow, nCol) != EmptyNumber) {
        alert("(row, col) == (" + nRow + ", " + nCol + ") is invalid.");
        return returnObject;
    }

    for (var i = 0; i < nNumDirections; ++i) {
        var bOwnPieceFound = false;
        var nRow2 = nRow;
        var nCol2 = nCol;
        var nSquaresToFlip = 0;

        // Pass 1: Scan and count.

        for (; ; ) {
            nRow2 += ady[i];
            nCol2 += adx[i];

            if (nRow2 < 0 || nRow2 >= nBoardHeight ||
				nCol2 < 0 || nCol2 >= nBoardWidth ||
				getSquareState(nRow2, nCol2) == EmptyNumber) {
                break;
            }

            if (getSquareState(nRow2, nCol2) == nPlayer) {
                bOwnPieceFound = true;
                break;
            }

            nSquaresToFlip++;
        }

        if (!bOwnPieceFound) {
            continue;
        }

        // Pass 2: Flip.
        nRow2 = nRow;
        nCol2 = nCol;

        for (var j = 0; j < nSquaresToFlip; ++j) {
            nRow2 += ady[i];
            nCol2 += adx[i];

            setSquareState(nRow2, nCol2, nPlayer, visible);
            nScore += 2 * squareScore(nRow2, nCol2);

            if (undoBuffer != null) {
                // Add (nRow2, nCol2) to the undo queue.
                undoBuffer.push(nRow2 * nBoardWidth + nCol2);
            }

            nUndoSize++;
        }
    }

    if (nUndoSize > 0) {
        setSquareState(nRow, nCol, nPlayer, visible);
        returnObject.numPiecesFlipped = nUndoSize;
        returnObject.score = nScore + squareScore(nRow, nCol);
    }
    // Else no opposing pieces were flipped, and the move fails.

    return returnObject;
}

var WhiteNumber = 0;
var BlackNumber = 1;
var NumberOfCurrentPlayer = WhiteNumber;

var noAutomatedMovePossible = 0;

var PlayerNames = new Array(2);
var PlayerIsAutomated = new Array(2);
var PlayerPly = [6, 6];

PlayerNames[WhiteNumber] = "White";
PlayerNames[BlackNumber] = "Black";
PlayerIsAutomated[WhiteNumber] = false;
PlayerIsAutomated[BlackNumber] = true;

// **** jQuery Function Declarations ****

$(document).ready(function () {
    onPageLoad();
});

// **** Function Declarations ****

function getImagePath(imageNumber) {
    var imageName = "Empty";

    if (imageNumber == WhiteNumber) {
        imageName = "White";
    } else if (imageNumber == BlackNumber) {
        imageName = "Black";
    }

    return "images/" + imageName + ".png";
}

function displayTurnMessage() {
    var turnMessage;

    if (isGameNotOver()) {
        turnMessage = PlayerNames[NumberOfCurrentPlayer];

        if (PlayerIsAutomated[NumberOfCurrentPlayer]) {
            turnMessage = turnMessage + " is thinking...";
        } else {
            turnMessage = turnMessage + "'s turn.";
        }
    } else {
        var whiteLead = PiecePopulations[WhiteNumber] - PiecePopulations[BlackNumber];

        if (whiteLead > 0) {
            turnMessage = PlayerNames[WhiteNumber] + " wins.";
        } else if (whiteLead < 0) {
            turnMessage = PlayerNames[BlackNumber] + " wins.";
        } else {
            turnMessage = "Tie game.";
        }

        turnMessage = "Game over; " + turnMessage;
    }

    $("#turnMessage").html(turnMessage);

    $("#numberOfWhitePiecesID").html(PiecePopulations[WhiteNumber]);
    $("#numberOfBlackPiecesID").html(PiecePopulations[BlackNumber]);
}

function moveHelper(row, col) {
    var placePieceResult = placePiece(NumberOfCurrentPlayer, row, col, null, true);
    var nPlacePieceEffect = placePieceResult.numPiecesFlipped;

    if (nPlacePieceEffect > 0) {
        PiecePopulations[NumberOfCurrentPlayer] += nPlacePieceEffect + 1;
        PiecePopulations[1 - NumberOfCurrentPlayer] -= nPlacePieceEffect;
    }

    if (nPlacePieceEffect == 0 && PlayerIsAutomated[NumberOfCurrentPlayer]) {
        ++noAutomatedMovePossible;
    } else {
        noAutomatedMovePossible = 0;
    }

    NumberOfCurrentPlayer = 1 - NumberOfCurrentPlayer;
    displayTurnMessage();

    if (isGameNotOver() && PlayerIsAutomated[NumberOfCurrentPlayer]) {
        setTimeout("automatedMove()", 100);     // Wait for 100 ms before the next move to give the browser time to update the board.
    }
}

function getJSONTicTacToeRequest (boardString, player, maxPly, descriptor = {}) {
	let url = '/reversi/' + boardString + '/' + player + '/' + maxPly;

	if (descriptor.protocol || descriptor.name || descriptor.port) {
		const webServerProtocol = descriptor.protocol || 'http';
		const webServerName = descriptor.name || 'localhost';
		const webServerPort = descriptor.port || 3001;

		url = webServerProtocol + '://' + webServerName + ':' + webServerPort + url;
	}

	// This is essentially an augmented version of jQuery's AJAX $.getJSON()
	// See https://api.jquery.com/jquery.getjson/
	$.ajax({								// eslint-disable-line no-undef
		dataType: 'json',
		url: url,
		success: function (result) {
			moveHelper(result.bestRow, result.bestColumn);
		},
		error: function (error) {
			const message = 'getJSONTicTacToeRequest() sent to \'' + url + '\' failed; error is: ' + error.status + ' ' + error.statusText;

			console.error(message);
			alert(message);									// eslint-disable-line no-alert
		}
	});
}

function playerNumberToPlayerCharacter(n) {

	if (n === 0) {
		return 'X';
	} else if (n === 1) {
		return 'O';
	} else {
		return 'E';
	}
}

function automatedMove () {
	let boardString = aBoardImageNumbers.map(playerNumberToPlayerCharacter).join('');
	const player = playerNumberToPlayerCharacter(NumberOfCurrentPlayer);
	const maxPly = PlayerPly[NumberOfCurrentPlayer];

	getJSONTicTacToeRequest(boardString, player, maxPly);
}

function squareClicked(i) {

    if (PlayerIsAutomated[NumberOfCurrentPlayer]) {
        return;
    }

    var row = parseInt(i / nBoardWidth, 10);
    var col = i % nBoardWidth;

    moveHelper(row, col);
}

function populateLookaheadDDL(ddlID) {
    $("#" + ddlID).html("");    // Clear the list.

    for (var i = 1; i <= 10; ++i) {
        $("<option>" + i + "</option>").appendTo("#" + ddlID);
    }
}

function constructBoard() {
    var pathToEmptyImage = getImagePath(EmptyNumber);
    var i = 0;

    for (var r = 0; r < nBoardHeight; ++r) {
        var rowName = "row" + r;

        $("<tr id='" + rowName + "'></tr>").appendTo("#board");

        for (var c = 0; c < nBoardWidth; ++c) {
            $("<td><img name='squares' src='" + pathToEmptyImage + "' onclick='squareClicked(" + i + ")' /></td>").appendTo("#" + rowName);
            ++i;
        }
    }

    populateLookaheadDDL("ddlLookaheadWhite");
    populateLookaheadDDL("ddlLookaheadBlack");

    $("#cbAutomateWhite").prop("checked", PlayerIsAutomated[WhiteNumber]);
    $("#cbAutomateBlack").prop("checked", PlayerIsAutomated[BlackNumber]);
    $("#ddlLookaheadWhite").val(PlayerPly[WhiteNumber]);
    $("#ddlLookaheadBlack").val(PlayerPly[BlackNumber]);
    $("#ddlLookaheadWhite").prop("disabled", !PlayerIsAutomated[WhiteNumber]);
    $("#ddlLookaheadBlack").prop("disabled", !PlayerIsAutomated[BlackNumber]);
    aBoardImageNumbers = new Array(nBoardArea);
    PiecePopulations = new Array(2);
    newGame();
}

// **** Event Handlers ****

function onPageLoad() {
    constructBoard();
}

function newGame() {
    var pathToEmptyImage = getImagePath(EmptyNumber);
    var centreRow = parseInt(nBoardHeight / 2, 10);
    var centreCol = parseInt(nBoardWidth / 2, 10);

    for (var i = 0; i < aBoardImageNumbers.length; ++i) {
        aBoardImageNumbers[i] = EmptyNumber;
    }

    $("[name='squares']").each(function () {
        $(this).prop("src", pathToEmptyImage);
    });

    setSquareState(centreRow - 1, centreCol - 1, WhiteNumber, true);
    setSquareState(centreRow, centreCol, WhiteNumber, true);
    setSquareState(centreRow - 1, centreCol, BlackNumber, true);
    setSquareState(centreRow, centreCol - 1, BlackNumber, true);
    PiecePopulations[WhiteNumber] = 2;
    PiecePopulations[BlackNumber] = 2;
    NumberOfCurrentPlayer = WhiteNumber;
    noAutomatedMovePossible = 0;
    displayTurnMessage();

    if (PlayerIsAutomated[NumberOfCurrentPlayer]) {
        setTimeout("automatedMove()", 100);
    }
}

function cbAutomateWhite_onChange() {
    PlayerIsAutomated[WhiteNumber] = $("#cbAutomateWhite").prop("checked");
    $("#ddlLookaheadWhite").prop("disabled", !PlayerIsAutomated[WhiteNumber]);

    if (PlayerIsAutomated[WhiteNumber] && NumberOfCurrentPlayer == WhiteNumber) {
        automatedMove();
    }
}

function cbAutomateBlack_onChange() {
    PlayerIsAutomated[BlackNumber] = $("#cbAutomateBlack").prop("checked");
    $("#ddlLookaheadBlack").prop("disabled", !PlayerIsAutomated[BlackNumber]);

    if (PlayerIsAutomated[BlackNumber] && NumberOfCurrentPlayer == BlackNumber) {
        automatedMove();
    }
}

function ddlLookaheadWhite_onChange() {
    PlayerPly[WhiteNumber] = parseInt($("#ddlLookaheadWhite").val(), 10);
}

function ddlLookaheadBlack_onChange() {
    PlayerPly[BlackNumber] = parseInt($("#ddlLookaheadBlack").val(), 10);
}
