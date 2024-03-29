/**
 * The Bermuda Triangle is a puzzle game with a triangular board that's large
 * enough to hold 16 small triangular wooden pieces. Each piece has 3 colored
 * dots on it - one per side. The board has 4 colored dots along each side of
 * the triangular indentation that holds all the smaller pieces.
 *
 * To solve the puzzle, match the colored dots where sides of the pieces touch
 * and where they align with the dots on the sides of the board.
 *
 * There are well over 900 QUINTILLION (9 x 10^20) ways to randomly arrange
 * the pieces on the board but there's only 1 unique solution to the puzzle!
 * (There are 3 duplicate pieces so there are 8 duplicate solutions.)
 */

//
// Types and explanations to clarify definitions and organization
//

type Dot = 'Red' | 'Yellow' | 'Green' | 'Blue' | 'White' | 'Black'

/** There are 4 colored dots per side of the board */
type BoardSide = [Dot, Dot, Dot, Dot]

/** There are 3 colored dots per piece, listed in clockwise order
 * @example ['Red', 'Yellow', 'Blue'] represents a piece that looks like:
 * . . . ./\
 * . . ./   \
 * . ./ r  y \
 * ./    b    \
 * -------------
 * with the lower case letters each representing a dot.
 */
type Type = [Dot, Dot, Dot]

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

// Since some pieces have duplicates, this will allow me to deal with them
// as unique types with quantities to avoid listing redundant solutions.
type PieceQuantity = {
	/** Unique dot layout */
	type: Type
	quantity: 0 | 1 | 2
}

// There are 13 piece types so the list will always have 13 items.
type PieceQuantityList = [
	PieceQuantity,
	PieceQuantity,
	PieceQuantity,
	PieceQuantity,
	PieceQuantity,
	PieceQuantity,
	PieceQuantity,
	PieceQuantity,
	PieceQuantity,
	PieceQuantity,
	PieceQuantity,
	PieceQuantity,
	PieceQuantity
]

// A list of unique types and their quantities. (There are 3 duplicate pieces.)
const typesAndQuantities: PieceQuantityList = [
	// 0
	{
		type: [r, g, y],
		quantity: 1,
	},
	// 1
	{
		type: [r, g, w],
		quantity: 1,
	},
	// 2
	{
		type: [r, g, k],
		quantity: 1,
	},
	// 3
	{
		type: [r, w, y],
		quantity: 1,
	},
	//4
	{
		type: [r, k, g],
		quantity: 2,
	},
	//5
	{
		type: [y, g, b],
		quantity: 1,
	},
	// 6
	{
		type: [y, g, k],
		quantity: 1,
	},
	// 7
	{
		type: [y, w, g],
		quantity: 2,
	},
	// 8
	{
		type: [y, k, b],
		quantity: 1,
	},
	// 9
	{
		type: [g, k, k],
		quantity: 1,
	},
	// 10
	{
		type: [b, b, w],
		quantity: 1,
	},
	// 11
	{
		type: [b, w, w],
		quantity: 1,
	},
	// 12
	{
		type: [b, k, w],
		quantity: 2,
	},
] as const

/** Index number from pieces list. */
type Choice = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

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

/**
 * Index of rotation of the piece for a specific arrangement.
 * 0 is no rotation, 1 means the second dot is now first, and 2 means the
 * last dot is now first. (Counter-clockwise steps since the dots are
 * described in clockwise order) */
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

//
// Functions to help solve the puzzle
//

/** Determine the orientations (fits) for the piece to match the dots given.
 * @returns An array of numbers 0-2 representing the rotation(s) for a fit,
 * an empty array means it doesn't fit the constraints
 */
const fitsThatMatchTheConstraints = (
	dots: DotSituation,
	piece: Type
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
	const piece = typesAndQuantities[pieceNumber].type
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

const solvePuzzle = (
	availablePieces: PieceQuantityList,
	placementsSoFar: Arrangement,
	recursionLevel: number = 0
): void => {
	const spot = nextOpentSpot(placementsSoFar as Arrangement)

	if (!spot) {
		console.log('\nSolution number %i:', ++totalSolutions)
		displayArrangement(placementsSoFar)
		return
	}

	const situation = situationAtSpot(placementsSoFar as Arrangement, spot)
	availablePieces.forEach((_piece, availableIndex) => {
		const piece = typesAndQuantities[availableIndex]

		// Skip fully used pieces
		if (piece.quantity <= 0) {
			return
		}

		const fits = fitsThatMatchTheConstraints(situation, piece.type)
		fits.forEach((fit) => {
			const newAvailablePieces = availablePieces.map(
				({ type, quantity }, i2) => ({
					type,
					quantity: availableIndex === i2 ? --quantity : quantity,
				})
			) as PieceQuantityList

			const newArrangement = cloneArrangement(placementsSoFar)
			newArrangement[spot.row][spot.col] = {
				piece: availableIndex as Choice,
				rotation: fit,
			}
			console.log()

			solvePuzzle(newAvailablePieces, newArrangement, recursionLevel + 1)
		})
	})
}

//
// Run stuff and display results
//

console.log('\nStarting solver')
console.log('There are 16 pieces and each has 3 possible orientations.')
console.log(
	'That means there are (16 * 3) * (15 * 3) * ... * (1 * 3) possible arrangements.'
)

const possibilities = new Array(16)
	.fill(undefined)
	.map((_, index) => index + 1)
	.map((numberOfPiecesLeft) => numberOfPiecesLeft * 3)
	.reduce(
		(total, optionsForNextPiece) => total * BigInt(optionsForNextPiece),
		BigInt(1)
	)

console.log(
	`That's ${possibilities.toLocaleString()} possible ways to orient the pieces in the puzzle!`
)
const allPieceQuantities = typesAndQuantities.map((piece) => ({
	...piece,
})) as PieceQuantityList
console.log(allPieceQuantities)

// console.log('\nSolving the first piece only...')
// solvePuzzle(pieceIndexes, [[false]] as unknown as Arrangement)
// 4 solutions - 3 unique

totalSolutions = 0
console.log('\nSolving the first two rows only...')
solvePuzzle(allPieceQuantities, [
	[false],
	[false, false, false],
] as unknown as Arrangement)
// 30 solutions - 18 unique

// totalSolutions = 0
// console.log('\nSolving the first three rows only...')
// solvePuzzle(pieceIndexes, [
// 	[false],
// 	[false, false, false],
// 	[false, false, false, false, false],
// ] as unknown as Arrangement)
// 773 solutions - ??? unique

// totalSolutions = 0
// console.log('\nSolving the whole puzzle...')
// const emptyPuzzle: Arrangement = [
// 	[false],
// 	[false, false, false],
// 	[false, false, false, false, false],
// 	[false, false, false, false, false, false, false],
// ]
// solvePuzzle(pieceIndexes, emptyPuzzle)
// 8 solutions - 1 unique

console.log('\n')
