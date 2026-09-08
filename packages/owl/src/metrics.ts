/**
 * Where everything is. Every number came off the 1024 artboard and none varies: the
 * accessories are drawn on that frame, so moving an eye moves it out of its glasses.
 */

export interface OwlMetrics {
  cx: number;
  /** Top of the head. */
  crown: number;
  /** Half the body's width where it is widest, at the shoulder. */
  half: number;
  /** The y the body stops growing outward and starts flaring into the skirt. */
  shoulder: number;
  /** shoulder - crown. Every head-relative fraction is measured in these. */
  headHeight: number;

  faceTop: number;
  faceHalf: number;
  faceHeight: number;

  eyeY: number;
  /** Centre to centre. */
  eyeGap: number;
  eyeR: number;

  beakTop: number;
  beakHalf: number;
  beakHeight: number;
}

/** The drawn owl, measured. */
export const OWL: OwlMetrics = {
  cx: 512,
  crown: 191,
  half: 395,
  shoulder: 677,
  headHeight: 486,

  faceTop: 353,
  faceHalf: 289.5,
  faceHeight: 419,

  eyeY: 495.7,
  eyeGap: 286.3,
  eyeR: 50.5,

  beakTop: 573.19,
  beakHalf: 60,
  beakHeight: 104,
};
