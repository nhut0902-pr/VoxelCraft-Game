import { useStore } from '../hooks/useStore';
import { Cube } from './Cube';
import { Animal } from './Animal';

export const Cubes = () => {
  const cubes = useStore((state) => state.cubes);

  return (
    <>
      {cubes.map((cube) => (
        <Cube key={cube.id} position={cube.pos} type={cube.type} />
      ))}
      <Animal position={[5, 0, 5]} />
      <Animal position={[-5, 0, -5]} />
      <Animal position={[10, 0, -10]} />
    </>
  );
};
