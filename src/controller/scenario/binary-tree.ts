import {isNullOrUndefined} from "util";
interface Node {
    speed: number;
    model: (x: number) => number;
    points: [[number, number], [number, number]],
    left: Node;
    right: Node;
}

class BinaryTree {

    private _root: Node;

    public find(speed: number): Node {
        let current = this._root,
            node: Node = this._root;

        if (isNullOrUndefined(current.left) && isNullOrUndefined(current.right))
            return current;

        while (!isNullOrUndefined(current)) {
            if (current.speed === speed) {
                return current;
            } else if (current.speed > speed) {
                current = current.left;
            } else {
                current = current.right;
            }
            if (!isNullOrUndefined(current))
                node = current;
        }


        return node;
    }

    public insert(speed: number, points: [[number, number], [number, number]], model: (x: number) => number): void {
        let node: Node = {
            speed: speed,
            model: model,
            points: points,
            left: null,
            right: null
        };

        if (isNullOrUndefined(this._root)) {
            this._root = node;
            return;
        }

        let current = this._root,
            parent: Node;

        while (true) {
            parent = current;
            if (speed < current.speed) {
                current = current.left;
                if (isNullOrUndefined(current)) {
                    parent.left = node;
                    return;
                }
            } else {
                current = current.right;
                if (isNullOrUndefined(current)) {
                    parent.right = node;
                    return;
                }
            }
        }
    }
}


export{BinaryTree, Node};