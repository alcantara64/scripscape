import { Ref } from "react"
import { StyleProp, ViewStyle } from "react-native"
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel"

export interface CarouselProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  carouselRef: Ref<ICarouselInstance> | undefined
  data: Array<any>
  renderItem: any
  width: any
  onScroll?: any
}

/**
 * Describe your component here
 */
export const AppCarousel = (props: CarouselProps) => {
  const { carouselRef, data, renderItem, width, onScroll } = props

  return (
    <Carousel
      ref={carouselRef}
      data={data}
      renderItem={renderItem}
      width={width}
      onSnapToItem={onScroll}
    />
  )
}
