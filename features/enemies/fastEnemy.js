module.exports = {
    createEnemy: () => ({
        id: Date.now(),
        x: 50,
        y: 50,
        health: 50,
        speed: 4,
        type: 'fast',
    }),
};
