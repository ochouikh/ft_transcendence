export interface GameResponse {
    type: 'init_paddle' | 'paddle' | 'ball' | 'score' | 'end',
    x?: number,
    y?: number,
    my?: number,
    side?: number,
}

export interface GameReq {
    type: 'start' | 'update',
    y?: number,
}
