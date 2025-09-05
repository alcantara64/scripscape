import { Ref } from "react"
import { StyleProp, ViewStyle } from "react-native"
import Carousel, { CarouselRenderItem, ICarouselInstance } from "react-native-reanimated-carousel"

export interface CarouselProps<T> {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  carouselRef?: Ref<ICarouselInstance> | undefined
  data: Array<T>
  renderItem: CarouselRenderItem<T>
  width: number
  onScroll?: (event: any) => void
  height: number
}

/**
 * Describe your component here
 */
export const AppCarousel = <T,>(props: CarouselProps<T>) => {
  const { carouselRef, data, renderItem, width, onScroll, height } = props

  return (
    <Carousel
      ref={carouselRef}
      data={data}
      renderItem={renderItem}
      width={width}
      height={height}
      onSnapToItem={onScroll}
      autoPlay
      autoPlayInterval={6000}
      scrollAnimationDuration={1000}
    />
  )
}
