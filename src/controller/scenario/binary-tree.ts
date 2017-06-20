interface Node {
    speed: number;
    model: (x: number) => number;
    left: Node;
    right: Node;
}

class BinaryTree {

    private _root: Node;

    public find(speed: number): Node {
        let current = this._root,
            node: Node;

        if (current.left === null && current.right === null)
            return current;

        while (current != null) {
            if (current.speed === speed) {
                return current;
            } else if (current.speed > speed) {
                current = current.left;
            } else {
                current = current.right;
            }
            if (current !== null)
                node = current;
        }
        return node;
    }

    public  insert(speed: number, model: (x: number) => number): void {
        let node: Node = {
            speed: speed,
            model: model,
            left: null,
            right: null
        };

        if (this._root === null) {
            this._root = node;
            return;
        }

        let current = this._root,
            parent: Node;

        while (true) {
            parent = current;
            if (speed < current.speed) {
                current = current.left;
                if (current === null) {
                    parent.left = node;
                    return;
                }
            } else {
                current = current.right;
                if (current === null) {
                    parent.right = node;
                    return;
                }
            }
        }

    }
}


export{BinaryTree, Node};