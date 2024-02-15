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

type Dot = "Red" | "Yellow" | "Green" | "Blue" | "White" | "Black";

/** There are 4 colored dots per side of the board */
type BoardSide = Dot[];

/** There are 3 colored dots per piece, listed in clockwise order
 * @example ['Red', 'Yellow', 'Blue'] represents a piece that looks like:
 * . . . ./\
 * . . ./   \
 * . ./ r  y \
 * ./    b    \
 * -------------
 * with the lower case letters each representing a dot.
 */
type Piece = Dot[];

// Color abbreviations
const r: Dot = "Red";
const y: Dot = "Yellow";
const g: Dot = "Green";
const b: Dot = "Blue";
const w: Dot = "White";
const k: Dot = "Black";

// First sides are listed top to bottom
const leftSide: BoardSide = [w, r, w, y];
const rightSide: BoardSide = [b, r, g, k];
// Bottom is listed left to right
const bottomSide: BoardSide = [g, g, w, g];

const pieces: Piece[] = [
    [r, k, g], // Piece 0
    [r, w, y],
    [y, w, g],
    [b, k, w], // Piece 3
    [y, g, b],
    [b, w, w],
    [r, k, g], // Piece 6
    [r, g, k],
    [g, k, k],
    [y, g, k], // Piece 9
    [r, g, w],
    [y, w, g],
    [b, k, w], // Piece 12
    [r, g, y],
    [b, b, w],
    [y, k, b], // Piece 15
];

/**
 * Numbering of spots by Row and "Column" (number in the row)
 * 
 * Odd columns always have dots on the left, right, and bottom.
 * Even columns always have dots on the top, left, and right.
 * 
 * @example
 *             1.1
 *         2.1 2.2 2.3
 *     3.1 3.2 3.3 3.4 3.5
 * 4.1 4.2 4.3 4.4 4.5 4.6 4.7
 */
type Row = number
type Column = number
type Position = `${Row}.${Column}`

/** 
 * A representation of the already decided dots around a piece.
 * Depending on the location in the puzzle, 1, 2, or 3 may be locked in.
 */
type DotSituation = [Dot] | [Dot, Dot] | [Dot, Dot, Dot]

/** Index of rotation of the piece for a specific arrangement */
type Rotation = 0 | 1 | 2;

/** How a piece fits in the puzzle */
type Fits = {
    /** Index in piece array */
    piece: number;
    /** Index of rotation of the piece */
    rotations: Rotation[];
};




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
                itFits = false;
            }
        })
        return itFits
    })
    const fitsThatMatch = fitWorks.reduce<Rotation[]>((fitNumbers, doesFit, index) =>
        doesFit ? fitNumbers.concat(index as Rotation) : fitNumbers, [])
    return fitsThatMatch;
};

/** Determine the orientations (fits) for the piece to match the dot given.
 * @returns An array of numbers 0-2 representing the orientation(s) for a fit
 */
const fitsThatMatchOneDot = (
    dotToMatch: Dot,
    piece: Piece
): Rotation[] => {
    return fitsThatMatchTheConstraints([dotToMatch], piece)
};

/** Determine the orientation (fit) for the piece to match the 2 dots given.
 * @returns A number 0-2 representing the fit or undefined if it doesn't fit
 */
const fitsThatMatchTwoDots = (
    firstDotToMatch: Dot,
    secondDotToMatch: Dot,
    piece: Piece
): Rotation[] => {
    return fitsThatMatchTheConstraints([firstDotToMatch, secondDotToMatch], piece)
};

const fitsThatMatchFirstSpot = (piece: Piece): Rotation[] =>
    fitsThatMatchTwoDots(leftSide[0], rightSide[0], piece);




console.log('Starting solver');
console.log('There are 16 pieces and each has 3 possible orientations.')
console.log('That means there are (16 * 3) * (15 * 3) * ... * (1 * 3) possible arrangements.')

const possibilities =
    (new Array(16))
        .fill(undefined)
        .map((_, index) => index + 1)
        .map(numberOfPiecesLeft => numberOfPiecesLeft * 3)
        .reduce((total, optionsForNextPiece) => total * BigInt(optionsForNextPiece), BigInt(1))

console.log('That\'s %i possible ways to orient the pieces in the puzzle!', possibilities)

console.log('Pieces that fit in the first spot');
const firstSpotFits = pieces
    .map((p, index) => [fitsThatMatchFirstSpot(p), index] as [Rotation[], number])
    .filter(([rotations]) => rotations.length > 0)
    .map(([rotations, index]) => ({ piece: index, fits: rotations }));
console.log(firstSpotFits);

console.log('Pieces that have at least one blue side')
const piecesWithABlueDot = pieces
    .map((p, index) => [fitsThatMatchOneDot(b, p), index] as [number[], number])
    .filter(([rotations]) => rotations.length > 0)
    .map(([rotations, index]) => ({ piece: index, fits: rotations }));
console.log(piecesWithABlueDot);