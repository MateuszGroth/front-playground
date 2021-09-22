export default function Interview() {
    const clusterFact = new MyLinearClusterDetectorFactory();
    const clustDetector = clusterFact.create(5);
    // const clustDetectoro = clusterFact.create(10.5);
    // const clustDetectord = clusterFact.create(0);
    // [-5, 5, 0].forEach((val) => {
    //     clustDetector.accept(val);
    // });
    [5, -5, 0, 10, 15, 2].forEach((val) => {
        clustDetector.accept(val);
    });

    console.log(clustDetector.clusterCount());
    return <div>Interview</div>;
}

export interface LinearClusterDetectorFactory {
    create(spacing: number): LinearClusterDetector;
}

export interface LinearClusterDetector {
    /*
        This method will be repeatedly called to provide new data points.
     */
    accept(value: number): void;

    /*
        This method returns the number of clusters detected so far.
        It may be called multiple times while new data keeps flowing in.
     */
    clusterCount(): number;
}

/**
 * This class must remain in this file so our tests can find it.
 *
 * You may change it however you wish as long as the contract stays fulfilled.
 */
export class MyLinearClusterDetectorFactory implements LinearClusterDetectorFactory {
    create(spacing: number): LinearClusterDetector {
        return new MyLinearClusterDetector(spacing);
    }
}

/**
 * Initial, wrong implementation.
 *
 * You may fix this one here or remove it and provide correct one in a separate file.
 */
const isInt = (value: number) => Math.round(value) === value;

/**
 * Initial, wrong implementation.
 *
 * You may fix this one here or remove it and provide correct one in a separate file.
 */
class MyLinearClusterDetector implements LinearClusterDetector {
    constructor(readonly spacing: number) {
        if (isNaN(spacing) || spacing <= 0 || !isInt(spacing)) {
            throw 'Error: Invalid Spacing';
        }
    }

    clusters: Array<Array<number>> = [];

    accept = (value: number): void => {
        if (isNaN(value) || !isInt(value)) {
            throw 'Error: Invalid parameter';
        }
        if (!this.clusters.length) {
            this.clusters.push([value]);
            return;
        }

        let isJoined = false;
        let joinedClusterIndex = 0;
        for (const cluster of this.clusters) {
            let lowerExt;
            let higherExt;
            if (cluster.length === 1) {
                lowerExt = cluster[0] - this.spacing;
                higherExt = cluster[0] + this.spacing;
            } else {
                // length === 2
                lowerExt = cluster[0] - this.spacing;
                higherExt = cluster[1] + this.spacing;
            }
            const isJoiningCluster = value >= lowerExt && value <= higherExt;
            if (isJoiningCluster) {
                isJoined = true;
                break;
            }
            joinedClusterIndex++;
        }

        if (!isJoined) {
            let newClusterIndex = 0;
            for (const cluster of this.clusters) {
                const firstClusterValue = cluster[0];
                if (value < firstClusterValue) {
                    break;
                }
                newClusterIndex++;
            }
            this.clusters.splice(newClusterIndex, 0, [value]);

            return;
        }

        // is joined

        const joinedCluster = this.clusters[joinedClusterIndex];
        let isNewNumberLast = false;
        let isNewNumberFirst = false;
        if (joinedCluster.length === 1) {
            const currentClusterValue = joinedCluster[0];
            if (currentClusterValue === value) {
                // nothing
            } else if (currentClusterValue > value) {
                joinedCluster.unshift(value);
                isNewNumberFirst = true;
            } else {
                joinedCluster.push(value);
                isNewNumberLast = true;
            }
        } else {
            // length === 2
            const firstClusterValue = joinedCluster[0];
            const lastClusterValue = joinedCluster[1];
            if (value < firstClusterValue) {
                joinedCluster[0] = value;
                isNewNumberFirst = true;
            } else if (value > lastClusterValue) {
                joinedCluster[1] = value;
                isNewNumberLast = true;
            }
        }

        if (isNewNumberFirst && joinedClusterIndex > 0) {
            const prevCluster = this.clusters[joinedClusterIndex - 1];
            const lastPrevClusterValue = prevCluster[prevCluster.length - 1];
            if (Math.abs(lastPrevClusterValue - value) <= this.spacing) {
                const newJoinedCluster = [prevCluster[0], joinedCluster[joinedCluster.length - 1]];
                this.clusters.splice(joinedClusterIndex - 1, 2, newJoinedCluster);
                return;
            }
        }

        if (isNewNumberLast && joinedClusterIndex < this.clusters.length - 1) {
            const nextCluster = this.clusters[joinedClusterIndex + 1];
            const firstNextClusterValue = nextCluster[0];
            if (Math.abs(firstNextClusterValue - value) <= this.spacing) {
                const newJoinedCluster = [joinedCluster[0], nextCluster[nextCluster.length - 1]];
                this.clusters.splice(joinedClusterIndex, 2, newJoinedCluster);
                return;
            }
        }
    };

    clusterCount = (): number => {
        return this.clusters.length;
    };
}
