"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.semverCompare = void 0;
const semverCompare = (a, b) => {
    const pa = a.split('.');
    const pb = b.split('.');
    for (let i = 0; i < 3; i++) {
        const na = Number(pa[i]);
        const nb = Number(pb[i]);
        if (na > nb)
            return 1;
        if (nb > na)
            return -1;
        if (!Number.isNaN(na) && Number.isNaN(nb))
            return 1;
        if (Number.isNaN(na) && !Number.isNaN(nb))
            return -1;
    }
    return 0;
};
exports.semverCompare = semverCompare;
