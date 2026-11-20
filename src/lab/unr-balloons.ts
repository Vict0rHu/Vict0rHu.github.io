import * as T from 'three';
import { unrBalloonFlights } from './unr-content';
import { balloonModel } from './unr-models';

export function balloonFlights(parent: T.Group) {
  const flights = unrBalloonFlights.map((flight, i) => {
    const model = balloonModel(flight.color, flight.stripe);
    model.name = 'memory-hot-air-balloon';
    model.position.set(flight.x, flight.y, flight.z);
    model.scale.setScalar(flight.size);
    parent.add(model);
    return { model, flight, phase: i * 1.5 };
  });
  return (age: number, reduced: boolean) => {
    for (const { model, flight, phase } of flights) {
      const travel = ('travel' in flight ? flight.travel : undefined) ?? .32;
      model.position.set(flight.x + (reduced ? 0 : Math.sin(age * (travel > 1 ? .045 : .12) + phase) * travel),
        flight.y + (reduced ? 0 : Math.sin(age * .24 + phase) * .15),
        flight.z + (reduced ? 0 : Math.sin(age * .08 + phase) * .25));
      model.rotation.y = reduced ? 0 : Math.sin(age * .10 + phase) * .13;
    }
  };
}
