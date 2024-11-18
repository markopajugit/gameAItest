module.exports = {
    createEnemy: () => ({
        id: Date.now(),
        x: 50,
        y: 50,
        health: 200,
        speed: 1,
        type: 'tank',
    }),
};
