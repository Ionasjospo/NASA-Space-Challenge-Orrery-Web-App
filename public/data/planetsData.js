export const planets = [
    {
        name: 'Mercurio',
        size: 2,
        color: 0xaaaaaa,
        position: { x: 10, y: 0, z: 0 },
        orbitalRadius: 10,        // Radio de la órbita
        orbitalSpeed: 0.02,       // Velocidad de la órbita (más grande, más lento)
        orbitalPeriod: 88         // Días para completar una órbita
    },
    {
        name: 'Venus',
        size: 3,
        color: 0xffdd99,
        position: { x: 20, y: 0, z: 0 },
        orbitalRadius: 20,
        orbitalSpeed: 0.015,
        orbitalPeriod: 225
    },
    {
        name: 'Tierra',
        size: 3.5,
        color: 0x0000ff,
        position: { x: 30, y: 0, z: 0 },
        orbitalRadius: 30,
        orbitalSpeed: 0.01,
        orbitalPeriod: 365
    },
    // Añadir más planetas aquí...
];
