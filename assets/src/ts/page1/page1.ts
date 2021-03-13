/**
 *
 */
class Page1 {

    protected hello = 'world';

    constructor() {

    }

    log() {
        console.log('page 1');
    }
}

const page1 = new Page1();
page1.log();