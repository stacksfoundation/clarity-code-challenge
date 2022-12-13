(define-constant CONTRACT_ADDRESS (as-contract tx-sender))

(define-constant ERR_TITLE_DESCRIPTION_LINK_EMPTY (err u101))
(define-constant ERR_INVALID_FUND_GOAL (err u102))
(define-constant ERR_START_NOT_VALID (err u103))
(define-constant ERR_END_NOT_VALID (err u104))
(define-constant ERR_ID_NOT_FOUND (err u105))
(define-constant ERR_CANNOT_CANCEL (err u106))
(define-constant ERR_NOT_OWNER (err u107))
(define-constant ERR_NOT_STARTED (err u108))
(define-constant ERR_ENDED (err u109))
(define-constant ERR_PLEDGE_GREATER_THAN_ZERO (err u110))
(define-constant ERR_STX_TRANSFER_FAILED (err u111))
(define-constant ERR_NOT_PLEDGED (err u112))
(define-constant ERR_INVALID_UNPLEDGE_AMT (err u113))
(define-constant ERR_NOT_ENDED (err u114))
(define-constant ERR_GOAL_NOT_MET (err u115))
(define-constant ERR_ALREADY_CLAIMED (err u116))
(define-constant ERR_TARGET_NOT_REACHED (err u117))

;; calculate roughly 90 days based on block times of 10 minutes
(define-constant FUNDING_TIME_LIMIT u12960)

(define-data-var last-id uint u0)

(define-map Campaigns uint {
    title: (string-utf8 256),
    description: (buff 33),
    link: (string-utf8 256),
    fundGoal: uint,
    startsAt: uint,
    endsAt: uint,
    campaignOwner: principal,
    pledgedCount: uint,
    pledgedAmount: uint,
    claimed: bool,
    targetReached: bool,
    targetReachedBy: uint
})

(define-map Investments {contributor: principal, campaignId: uint} {amount: uint})
