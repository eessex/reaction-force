import React from "react"
import { MockBoot, renderRelayTree } from "DevTools"
import { graphql } from "react-relay"
import { ViewingRoomStatementRoute_Test_QueryRawResponse } from "__generated__/ViewingRoomStatementRoute_Test_Query.graphql"
import { Breakpoint } from "@artsy/palette"
import { ViewingRoomStatementRouteFragmentContainer } from "../ViewingRoomStatementRoute"
import { ViewingRoomStatmentRouteFixture } from "Apps/ViewingRoom/__tests__/Fixtures/ViewingRoomStatementRouteFixture"

jest.unmock("react-relay")
jest.mock("Artsy/Router/useRouter", () => ({
  useRouter: () => ({
    match: {
      params: {
        slug: "subscription-demo-gg-guy-yanai",
      },
    },
  }),
}))

describe("ViewingRoomStatementRoute", () => {
  const slug = "subscription-demo-gg-guy-yanai"

  const getWrapper = async (
    breakpoint: Breakpoint = "lg",
    response: ViewingRoomStatementRoute_Test_QueryRawResponse = ViewingRoomStatmentRouteFixture
  ) => {
    return await renderRelayTree({
      Component: ({ viewingRoom }) => {
        return (
          <MockBoot breakpoint={breakpoint}>
            <ViewingRoomStatementRouteFragmentContainer
              viewingRoom={viewingRoom}
            />
          </MockBoot>
        )
      },
      query: graphql`
        query ViewingRoomStatementRoute_Test_Query($slug: ID!)
          @raw_response_type {
          viewingRoom(id: $slug) {
            ...ViewingRoomStatementRoute_viewingRoom
          }
        }
      `,
      variables: {
        slug,
      },
      mockData: response,
    })
  }

  it("renders the correct components", async () => {
    const wrapper = await getWrapper()
    expect(wrapper.find("ViewingRoomIntro").length).toBe(1)
    expect(wrapper.find("ViewingRoomWorks").length).toBe(1)
    expect(wrapper.find("ViewingRoomPullQuote").length).toBe(1)
    expect(wrapper.find("ViewingRoomSubsections").length).toBe(1)
  })

  describe("ViewingRoomIntro", () => {
    it("renders an intro statement", async () => {
      const wrapper = (await getWrapper()).find("ViewingRoomIntro")
      expect(wrapper.text()).toContain(
        "Checked into a Club Med in the French Alps"
      )
    })
  })

  describe("ViewingRoomWorks", () => {
    let wrapper

    beforeEach(async () => {
      wrapper = (await getWrapper()).find("ViewingRoomWorks")
    })

    it("renders artworks", () => {
      const items = wrapper.find("ArtworkItem")
      expect(items.length).toBe(2)
      const a = items.at(0).html()
      expect(a).toContain("Bill Miles")
      expect(a).toContain("Beep Beep")
      expect(a).toContain("2015")
      const b = items.at(1).html()
      expect(b).toContain("Emma Johnson")
      expect(b).toContain("Please Do Not Touch")
      expect(b).toContain("2018")
    })

    it("renders buttons", async () => {
      expect(wrapper.find("Button").length).toBe(1)
      expect(wrapper.find("RouterLink").length).toBe(3)
      wrapper.find("RouterLink").forEach(link => {
        expect(link.html()).toContain(`href="/viewing-room/${slug}/works`)
      })
    })

    it("scrolls to top of page on button click", () => {
      let spy
      document.getElementById = jest.fn().mockReturnValue({
        getBoundingClientRect: () => ({
          top: 0,
        }),
      })
      wrapper.find("RouterLink").forEach(link => {
        spy = jest.fn()
        window.scrollTo = spy
        link.simulate("click")
        expect(spy).toHaveBeenCalled()
      })
    })
  })

  describe("ViewingRoomPullQuote", () => {
    it("displays the correct text", async () => {
      const wrapper = (await getWrapper()).find("ViewingRoomPullQuote")
      expect(wrapper.html()).toContain("I have everything I need right here")
    })
  })

  describe("ViewingRoomSubsections", () => {
    it("displays the correct text", async () => {
      const wrapper = (await getWrapper()).find("ViewingRoomSubsections")
      expect(wrapper.find("Image").length).toBe(1)
      const html = wrapper.html()
      expect(html).toContain("Guy Yanai")
      expect(html).toContain("His visual tools are both ubiquitous and obscure")
      expect(html).toContain("View of Guy Yanai’s studio in February 2019")
    })
  })
})
