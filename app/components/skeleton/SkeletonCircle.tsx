import { Skeleton, SkeletonProps } from "./Skeleton"

export const SkeletonCircle = ({ style, h = 40, w = 40 }: SkeletonProps) => {
  const size = typeof w === "number" ? w : h
  return <Skeleton style={style} h={h} w={w} r={999} />
}
