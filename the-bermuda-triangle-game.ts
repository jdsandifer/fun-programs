/**
 * The Bermuda Triangle is a puzzle game with a triangular board that's large
 * enough to hold 16 small triangular wooden pieces. Each piece has 3 colored
 * dots on it - one per side. The board has 4 colored dots along each side of
 * the triangular indentation that holds all the smaller pieces.
 *
 * To solve the puzzle, match the colored dots where sides of the pieces touch
 * and where they align with the dots on the sides of the board.
 *
 * AFAIK, there is only one solution...
 */

//
// Types and explanations to clarify definitions and organization
//

type Dot = 'Red' | 'Yellow' | 'Green' | 'Blue' | 'White' | 'Black'

/** There are 4 colored dots per side of the board */
type BoardSide = Dot[]

/** There are 3 colored dots per piece, listed in clockwise order
 * @example ['Red', 'Yellow', 'Blue'] represents a piece that looks like:
 * . . . ./\
 * . . ./   \
 * . ./ r  y \
 * ./    b    \
 * -------------
 * with the lower case letters each representing a dot.
 */
type Piece = Dot[]

// Color abbreviations
const r: Dot = 'Red'
const y: Dot = 'Yellow'
const g: Dot = 'Green'
const b: Dot = 'Blue'
const w: Dot = 'White'
const k: Dot = 'Black'

// Left and right sides are listed top to bottom
const leftSide: BoardSide = [w, r, w, y]
const rightSide: BoardSide = [b, r, g, k]
// Bottom is listed left to right
const bottomSide: BoardSide = [g, g, w, g]

const pieces: Piece[] = [
	[r, k, g], // 0
	[r, w, y],
	[y, w, g],
	[b, k, w], // 3
	[y, g, b],
	[b, w, w],
	[r, k, g], // 6
	[r, g, k],
	[g, k, k],
	[y, g, k], // 9
	[r, g, w],
	[y, w, g],
	[b, k, w], // 12
	[r, g, y],
	[b, b, w],
	[y, k, b], // 15
]

/**
 * Numbering of spot indexes by Row and "Column" (number in the row)
 *
 * Even columns always have dots on the left, right, and bottom.
 * Odd columns always have dots on the top, left, and right.
 *
 * @example
 *             0.0
 *         1.0 1.1 1.2
 *     2.0 2.1 2.2 2.3 2.4
 * 3.0 3.1 3.2 3.3 3.4 3.5 3.6
 */
type Position = {
	row: number
	col: number
}
/**
 * A representation of the already decided dots around a piece.
 * Depending on the location in the puzzle, 1, 2, or 3 may be locked in.
 */
type DotSituation = [Dot] | [Dot, Dot] | [Dot, Dot, Dot]

/** Index of rotation of the piece for a specific arrangement */
type Rotation = 0 | 1 | 2

/** How a piece is placed in the puzzle */
type Placement =
	| {
			piece: Choice
			rotation: Rotation
	  }
	| false

/** Piece arrangement in the puzzle. */
type Arrangement = [
	[Placement],
	[Placement, Placement, Placement],
	[Placement, Placement, Placement, Placement, Placement],
	[
		Placement,
		Placement,
		Placement,
		Placement,
		Placement,
		Placement,
		Placement
	]
]

/** Index number from pieces list. */
type Choice =
	| 0
	| 1
	| 2
	| 3
	| 4
	| 5
	| 6
	| 7
	| 8
	| 9
	| 10
	| 11
	| 12
	| 13
	| 14
	| 15

//
// Functions to help solve the puzzle
//

/** Determine the orientations (fits) for the piece to match the dots given.
 * @returns An array of numbers 0-2 representing the rotation(s) for a fit,
 * an empty array means it doesn't fit the constraints
 */
const fitsThatMatchTheConstraints = (
	dots: DotSituation,
	piece: Piece
): Rotation[] => {
	const rotationsToTry = [0, 1, 2]
	const fitWorks = rotationsToTry.map((rotation) => {
		let itFits = true
		dots.forEach((dot, dotIndex) => {
			const dotToCheckIndex = (rotation + dotIndex) % 3
			const dotsMatch = dot === piece[dotToCheckIndex]
			if (!dotsMatch) {
				itFits = false
			}
		})
		return itFits
	})
	const fitsThatMatch = fitWorks.reduce<Rotation[]>(
		(fitNumbers, doesFit, index) =>
			doesFit ? fitNumbers.concat(index as Rotation) : fitNumbers,
		[]
	)
	return fitsThatMatch
}

/** Find the next open space to check for matching pieces. */
const nextOpentSpot = (placements: Arrangement): Position | undefined => {
	for (let row = 0; row < placements.length; row++) {
		for (let col = 0; col < placements[row].length; col++) {
			if (placements[row][col] === false) {
				return { row, col }
			}
		}
	}
	return undefined
}

/** Account for rotation and return the dot on the side given. */
const getSideOfPiece = (sideIndex: number, placement: Placement): Dot => {
	if (!placement) {
		throw Error("Can't get piece side without a piece!")
	}
	const { piece: pieceNumber, rotation } = placement
	const piece = pieces[pieceNumber]
	const finalSide = (sideIndex + rotation) % 3
	return piece[finalSide]
}

/** Determine the pieces that need to match at a spot. */
const situationAtSpot = (
	placements: Arrangement,
	spot: Position
): DotSituation => {
	const { row, col } = spot
	let situation: undefined | DotSituation = undefined
	const colIsOdd = col % 2 !== 0
	// We'll build up the situation incrementally
	// Left side
	// If it's touching the left side of the board, add that first.
	if (col === 0) {
		situation = [leftSide[row]]
	}
	// Otherwise, get the piece to the left's side touching us first.
	else {
		// If the current piece is in an odd indexed columnd, we want the second side
		// or index 1 of the even piece to it's left (right side). If it's even,
		// we want the third side or index 2 of the odd piece to it's left.
		// All odd pieces point down and their left side is index 0 so the right
		// side is 2 (top is 1).
		const sideOfNeighboringPiece = colIsOdd ? 1 : 2
		const dot = getSideOfPiece(
			sideOfNeighboringPiece,
			placements[row][col - 1]
		)
		situation = [dot]
	}

	// Second side - right or top
	// If it's touching the right side of the board, add that.
	if (col === placements[row].length - 1) {
		situation.push(rightSide[row])
	}
	// Otherwise, if it's in an odd space, add the dot from the piece above it.
	else if (colIsOdd) {
		const bottomOfPieceAbove = 2
		const dot = getSideOfPiece(
			bottomOfPieceAbove,
			placements[row - 1][col - 1]
		)
		situation.push(dot)
	}

	// If it's on the last row, check the bottom board dots, too.
	// TODO: Not sure what to do with this yet - maybe rotate situation and then
	// rotate position after checking the match.
	// Or maybe a separate function that wraps this one and deals with that special case.

	// Finally, if it's the last piece in the puzzle add the bottom
	// as the third dot.
	if (row === 3 && col === 6) {
		situation.push(bottomSide[3])
	}

	return situation
}

// Tests
// let testPlacement = [[false]] as unknown as Arrangement
// let test = situationAtSpot(testPlacement, { row: 0, col: 0 })
// console.log(test)

const displayArrangement = (arrangement: Arrangement) => {
	for (let row = 0; row < arrangement.length; row++) {
		let rowDisplay = ''
		for (let col = 0; col < arrangement[row].length; col++) {
			const placement = arrangement[row][col]
			const { piece, rotation } = placement || {}
			rowDisplay += placement ? `${piece}.${rotation} ` : '.'
		}
		console.log(rowDisplay)
	}
}

const cloneArrangement = (arrangement: Arrangement): Arrangement => {
	let newArrangement = new Array(arrangement.length) as unknown as Arrangement
	for (let row = 0; row < arrangement.length; row++) {
		newArrangement[row] = new Array(arrangement[row].length) as any
		for (let col = 0; col < arrangement[row].length; col++) {
			newArrangement[row][col] = arrangement[row][col]
		}
	}
	return newArrangement
}

let totalSolutions = 0
// Recursive function?
// Need to pass pieces available, pieces used (empty space on grid), next spot
const solvePuzzle = (
	availableIndexes: (Choice | false)[],
	placementsSoFar: Arrangement,
	recursionLevel: number = 0
): void => {
	// if (totalSolutions >= 5) return
	const spot = nextOpentSpot(placementsSoFar as Arrangement)

	if (!spot) {
		console.log('Solution number %i!', ++totalSolutions)
		displayArrangement(placementsSoFar)
		return
	}

	const situation = situationAtSpot(placementsSoFar as Arrangement, spot)
	console.log(situation)
	availableIndexes.forEach((i) => {
		// Skip the pieces no longer available
		if (i === false) return

		const piece = pieces[i]
		const fits = fitsThatMatchTheConstraints(situation, piece)
		fits.forEach((f) => {
			const newAvailableIndexes = availableIndexes.map(
				// Use false to remove pieces so we don't change the indexes
				(i2) => (i2 === i ? false : i2)
			)
			const newArrangement = cloneArrangement(placementsSoFar)
			newArrangement[spot.row][spot.col] = { piece: i, rotation: f }

			solvePuzzle(newAvailableIndexes, newArrangement, recursionLevel + 1)
		})
	})
}

console.log('\nStarting solver')
console.log('There are 16 pieces and each has 3 possible orientations.')
console.log(
	'That means there are (16 * 3) * (15 * 3) * ... * (1 * 3) possible arrangements.'
)

//
// Run stuff and display results
//

const possibilities = new Array(16)
	.fill(undefined)
	.map((_, index) => index + 1)
	.map((numberOfPiecesLeft) => numberOfPiecesLeft * 3)
	.reduce(
		(total, optionsForNextPiece) => total * BigInt(optionsForNextPiece),
		BigInt(1)
	)

console.log(
	"That's %i possible ways to orient the pieces in the puzzle!",
	possibilities
)

const emptyPuzzle: Arrangement = [
	[false],
	[false, false, false],
	[false, false, false, false, false],
	[false, false, false, false, false, false, false],
]
const pieceIndexes: Choice[] = new Array(16)
	.fill(undefined)
	.map((_m, i) => i as Choice)

// console.log('\nSolving the first square only...')
// solvePuzzle(pieceIndexes, [[false]] as unknown as Arrangement)
// 4 solutions

// totalSolutions = 0
// console.log('\nSolving the first two rows only...')
// solvePuzzle(pieceIndexes, [
// 	[false],
// 	[false, false, false],
// ] as unknown as Arrangement)
// 165 solutions or so

totalSolutions = 0
console.log('\nSolving the first three rows only...')
solvePuzzle(pieceIndexes, [
	[false],
	[false, false, false],
	[false, false, false, false, false],
] as unknown as Arrangement)
// 773 solutions
