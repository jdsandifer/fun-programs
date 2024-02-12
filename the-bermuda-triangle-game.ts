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

/** How a piece fits in the puzzle */
type Fit = {
    /** Index in piece array */
    piece: number;
    /** Index of rotation of the piece */
    fit: number;
};

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
    [r, k, g],
    [r, w, y],
    [y, w, g],
    [b, k, w],
    [y, g, b],
    [b, w, w],
    [r, k, g],
    [r, g, k],
    [g, k, k],
    [y, g, k],
    [r, g, w],
    [y, w, g],
    [b, k, w],
    [r, g, y],
    [b, b, w],
    [y, k, b],
];

const fitWithTwoSidesOrUndefined = (
    firstDot: Dot,
    secondDot: Dot,
    piece: Piece
): undefined | number => {
    let fits: undefined | number = undefined;
    [0, 1, 2].forEach((leftDotIndex) => {
        const rightDotIndex = (leftDotIndex + 1) % 3;
        if (
            firstDot === piece[leftDotIndex] &&
            secondDot === piece[rightDotIndex]
        ) {
            fits = leftDotIndex;
        }
    });
    return fits;
};

const fitsInFirstSpotOrUndefined = (piece: Piece) =>
    fitWithTwoSidesOrUndefined(leftSide[0], rightSide[0], piece);

console.log("Starting solver");

console.log("Pieces that fit in the first spot");
const firstSpotFits = pieces
    .map((p, index) => [fitsInFirstSpotOrUndefined(p), index])
    .filter(([fits]) => fits !== undefined)
    .map(([fit, index]) => ({ piece: index, fit }));
console.log(firstSpotFits);
