import {IVehicle} from "../vehicle/IVehicle";
import {ITrack} from "./ITrack";
import {LocalizationTransitionUpdate} from "../message/v2c/LocalizationTransitionUpdate";
import {Finish} from "./Finish";
import {Curve} from "./Curve";
import {Straight} from "./Straight";
import {LocalizationPositionUpdate} from "../message/v2c/LocalizationPositionUpdate";
import {IVehicleMessage} from "../message/IVehicleMessage";
import {Start} from "./Start";
import {Track} from "./Track";
import {IPiece} from "./IPiece";

class TrackScanner {

    private _callback: Function
    private _locations: LocalizationPositionUpdate[]
    private _pieces: IPiece[]
    private _round: number
    private _scanning: boolean
    private _vehicle: IVehicle

    public scan(vehicle: IVehicle): Promise<ITrack> {
        const self = this

        return new Promise<ITrack>((resolve, reject) => {
            if(self._scanning) {
                reject(new Error("Scan is already running"))
            }
            self._locations = []
            self._pieces = []
            self._round = 0
            self._scanning = true
            self._callback = () => {
                self._scanning = false
                resolve(new Track(self._pieces))
            }
            self._vehicle = vehicle

            vehicle.addListener(self.onMessage.bind(self))
            vehicle.connect().then(() => {
                vehicle.setSpeed(400)
            }).catch(reject)
        })
    }

    private onMessage(message: IVehicleMessage) {
        if(message instanceof LocalizationTransitionUpdate
            && this._locations.length > 0) {
            const position = this._locations[0]
            const transition = message
            const piece = this.createPiece(position, transition)

            if(this._round === 2) {
                this.stopScan()
            } else if(this.isStart(position.roadPieceId)) {
                this._round++
            } else if(this._round === 1 && piece) {
                this._pieces.push(piece)
            }

            this._locations = []
        } else if(message instanceof LocalizationPositionUpdate) {
            this._locations.push(message)
        }
    }

    private stopScan() {
        const self = this

        this._vehicle.setSpeed(0, 1500)
        this._vehicle.removeListener(this.onMessage)
        this._vehicle.disconnect().then(() => {
            self._callback()
        })
    }

    private createPiece(position:LocalizationPositionUpdate, transition: LocalizationTransitionUpdate): IPiece | null {
        if(this.isCurve(transition)) {
            return new Curve(position.roadPieceId)
        }
        if(this.isStraight(position, transition)) {
            return new Straight(position.roadPieceId)
        }
        return null
    }

    private isStart(roadPieceId: number): boolean {
        return roadPieceId === Start.ID
    }

    private isFinish(roadPieceId: number): boolean {
        return roadPieceId === Finish.ID
    }

    private isStraight(position:LocalizationPositionUpdate, transition: LocalizationTransitionUpdate): boolean {
        return !this.isStart(position.roadPieceId)
        && !this.isFinish(position.roadPieceId)
        && Math.abs(transition.rightWheelDistCm - transition.leftWheelDistCm) === 0
    }

    private isCurve( transition: LocalizationTransitionUpdate): boolean {
       return Math.abs(transition.rightWheelDistCm - transition.leftWheelDistCm) > 0
    }

}

export{TrackScanner}