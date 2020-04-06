import { FeaturedFairs_fairs } from "__generated__/FeaturedFairs_fairs.graphql"
import {
  FeaturedRail,
  FeaturedRailCarousel,
  RailMetadata,
} from "Apps/FeatureAKG/Components/FeaturedRails"
import { compact } from "lodash"
import React from "react"
import { createFragmentContainer } from "react-relay"
import { graphql } from "relay-runtime"

interface FeaturedFairsRailProps {
  fairs: FeaturedFairs_fairs
  railMetadata: RailMetadata
}

const FeaturedFairsRail: React.FC<FeaturedFairsRailProps> = props => {
  const { title, subtitle, items } = props.railMetadata
  const { fairs } = props

  const itemsForCarousel = fairs.map(fair => {
    const matchingFairFromSpreadsheet = items.find(
      item => item.id === fair.internalID
    )

    if (matchingFairFromSpreadsheet) {
      return {
        ...fair,
        imageSrc: matchingFairFromSpreadsheet.image_src,
        subtitle: "Fair",
        title: fair.name,
      }
    } else {
      return null
    }
  })

  if (compact(itemsForCarousel).length > 0) {
    return (
      <FeaturedRail title={title} subtitle={subtitle}>
        <FeaturedRailCarousel itemsForCarousel={itemsForCarousel} />
      </FeaturedRail>
    )
  } else {
    return null
  }
}

export const FeaturedFairsRailFragmentContainer = createFragmentContainer(
  FeaturedFairsRail,
  {
    fairs: graphql`
      fragment FeaturedFairs_fairs on Fair @relay(plural: true) {
        internalID
        name
        href
      }
    `,
  }
)
