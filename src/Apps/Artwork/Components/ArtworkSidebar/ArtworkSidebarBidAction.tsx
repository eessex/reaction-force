import {
  Box,
  Button,
  Flex,
  HelpIcon,
  LargeSelect,
  Link,
  Sans,
  Separator,
  Serif,
  Spacer,
  Tooltip,
} from "@artsy/palette"
import React from "react"
import { createFragmentContainer, graphql } from "react-relay"

import { ArtworkSidebarBidAction_artwork } from "__generated__/ArtworkSidebarBidAction_artwork.graphql"
import { ArtworkSidebarBidAction_me } from "__generated__/ArtworkSidebarBidAction_me.graphql"
import * as Schema from "Artsy/Analytics/Schema"
import track from "react-tracking"
import { getENV } from "Utils/getENV"
import { bidderNeedsIdentityVerification } from "Utils/identityVerificationRequirements"

export interface ArtworkSidebarBidActionProps {
  artwork: ArtworkSidebarBidAction_artwork
  me: ArtworkSidebarBidAction_me
}

export interface ArtworkSidebarBidActionState {
  selectedMaxBidCents?: number
}

const RegisterToBidButton: React.FC<{ onClick: () => void }> = ({
  onClick,
}) => {
  return (
    <Button width="100%" size="large" mt={1} onClick={onClick}>
      Register to bid
    </Button>
  )
}

const IdentityVerificationDisclaimer: React.FC = () => {
  return (
    <Sans mt="1" size="3" color="black60" pb={1} textAlign="center">
      Identity verification required to bid.{" "}
      <Link href="/identity-verification-faq">FAQ</Link>
    </Sans>
  )
}

@track()
export class ArtworkSidebarBidAction extends React.Component<
  ArtworkSidebarBidActionProps,
  ArtworkSidebarBidActionState
> {
  state: ArtworkSidebarBidActionState = {
    selectedMaxBidCents: null,
  }

  setMaxBid = (newVal: number) => {
    this.setState({ selectedMaxBidCents: newVal })
  }

  redirectToRegister = () => {
    const { sale } = this.props.artwork
    const href = `/auction-registration/${sale.slug}`
    window.location.href = href
  }

  @track((props: ArtworkSidebarBidActionProps) => ({
    artwork_slug: props.artwork.slug,
    products: [
      {
        product_id: props.artwork.internalID,
        quantity: 1,
        price:
          props.artwork.myLotStanding &&
          props.artwork.myLotStanding[0] &&
          props.artwork.myLotStanding[0].most_recent_bid.max_bid.cents / 100,
      },
    ],
    auction_slug: props.artwork.sale.slug,
    context_page: Schema.PageName.ArtworkPage,
    action_type: Schema.ActionType.ClickedBid,
  }))
  redirectToBid(firstIncrement: number) {
    const { slug, sale } = this.props.artwork
    const bid = this.state.selectedMaxBidCents || firstIncrement
    const href = `/auction/${sale.slug}/bid/${slug}?bid=${bid}`
    window.location.href = href
  }

  @track({
    type: Schema.Type.Button,
    flow: Schema.Flow.Auctions,
    subject: Schema.Subject.EnterLiveAuction,
    context_module: Schema.ContextModule.Sidebar,
    action_type: Schema.ActionType.Click,
  })
  redirectToLiveBidding(me: ArtworkSidebarBidAction_me | null) {
    const { slug } = this.props.artwork.sale
    const liveUrl = `${getENV("PREDICTION_URL")}/${slug}`
    if (me) {
      window.location.href = `${liveUrl}/login`
    } else {
      window.location.href = liveUrl
    }
  }

  render() {
    const {
      artwork,
      artwork: { sale },
      me,
    } = this.props

    if (sale.is_closed) return null

    const registrationAttempted = !!sale.registrationStatus
    const qualifiedForBidding =
      registrationAttempted && sale.registrationStatus.qualified_for_bidding

    /**
     * NOTE: This is making an incorrect assumption that there could only ever
     *       be 1 live sale with this work. When we run into that case, there is
     *       likely design work to be done too, so we can adjust this then.
     */
    const myLotStanding = artwork.myLotStanding && artwork.myLotStanding[0]
    const hasMyBids = !!(myLotStanding && myLotStanding.most_recent_bid)

    const userNeedsIdentityVerification = bidderNeedsIdentityVerification({
      sale,
      user: me,
      bidder: sale.registrationStatus,
    })

    if (sale.is_preview) {
      let PreviewAction: React.FC

      if (registrationAttempted) {
        if (qualifiedForBidding) {
          PreviewAction = () => (
            <Button width="100%" size="large" mt={1} disabled>
              Registration complete
            </Button>
          )
        } else {
          PreviewAction = () => (
            <Button width="100%" size="large" mt={1} disabled>
              Registration pending
            </Button>
          )
        }
      } else {
        PreviewAction = () => (
          <RegisterToBidButton onClick={this.redirectToRegister} />
        )
      }
      return (
        <Box>
          <PreviewAction />
          {userNeedsIdentityVerification && <IdentityVerificationDisclaimer />}
        </Box>
      )
    }

    if (sale.is_live_open) {
      const notApprovedBidderBeforeRegistrationClosed: boolean =
        sale.is_registration_closed && !qualifiedForBidding

      if (notApprovedBidderBeforeRegistrationClosed) {
        return (
          <Box>
            <Sans size="2" color="black60" pb={1} textAlign="center">
              Registration closed
            </Sans>
            <Button
              width="100%"
              size="large"
              onClick={() => this.redirectToLiveBidding(me)}
            >
              Watch live bidding
            </Button>
          </Box>
        )
      } else {
        return (
          <Box>
            <Button
              width="100%"
              size="large"
              onClick={() => this.redirectToLiveBidding(me)}
            >
              Enter live bidding
            </Button>
            {userNeedsIdentityVerification && (
              <IdentityVerificationDisclaimer />
            )}
          </Box>
        )
      }
    }

    if (sale.is_open) {
      if (registrationAttempted && !qualifiedForBidding) {
        return (
          <Box>
            <Button width="100%" size="large" disabled>
              Registration pending
            </Button>
            {userNeedsIdentityVerification && (
              <IdentityVerificationDisclaimer />
            )}
          </Box>
        )
      }
      if (sale.is_registration_closed && !qualifiedForBidding) {
        return (
          <Button width="100%" size="large" disabled>
            Registration closed
          </Button>
        )
      }

      const myLastMaxBid =
        hasMyBids && myLotStanding.most_recent_bid.max_bid.cents
      const increments = artwork.sale_artwork.increments.filter(
        increment => increment.cents > (myLastMaxBid || 0)
      )
      const firstIncrement = increments[0]
      const selectOptions = increments.map(increment => ({
        value: increment.cents.toString(),
        text: increment.display,
      }))

      if (userNeedsIdentityVerification) {
        return (
          <Box>
            <RegisterToBidButton onClick={this.redirectToRegister} />
            <IdentityVerificationDisclaimer />
          </Box>
        )
      } else {
        return (
          <Box>
            <Separator mb={2} />
            <Flex width="100%" flexDirection="row">
              <Serif size="3t" color="black100" mr={1}>
                Place max bid
              </Serif>
              <Tooltip content="Set the maximum amount you would like Artsy to bid up to on your behalf">
                <HelpIcon />
              </Tooltip>
            </Flex>
            <LargeSelect options={selectOptions} onSelect={this.setMaxBid} />
            <Spacer mb={2} />
            <Button
              width="100%"
              size="large"
              onClick={() => this.redirectToBid(firstIncrement.cents)}
            >
              {hasMyBids ? "Increase max bid" : "Bid"}
            </Button>
          </Box>
        )
      }
    }
  }
}

export const ArtworkSidebarBidActionFragmentContainer = createFragmentContainer(
  (props: ArtworkSidebarBidActionProps) => {
    return <ArtworkSidebarBidAction {...props} />
  },
  {
    artwork: graphql`
      fragment ArtworkSidebarBidAction_artwork on Artwork {
        myLotStanding(live: true) {
          most_recent_bid: mostRecentBid {
            max_bid: maxBid {
              cents
            }
          }
        }
        slug
        internalID
        sale {
          slug
          registrationStatus {
            qualified_for_bidding: qualifiedForBidding
          }
          is_preview: isPreview
          is_open: isOpen
          is_live_open: isLiveOpen
          is_closed: isClosed
          is_registration_closed: isRegistrationClosed
          requireIdentityVerification
        }
        sale_artwork: saleArtwork {
          increments {
            cents
            display
          }
        }
      }
    `,
    me: graphql`
      fragment ArtworkSidebarBidAction_me on Me {
        identityVerified
      }
    `,
  }
)
