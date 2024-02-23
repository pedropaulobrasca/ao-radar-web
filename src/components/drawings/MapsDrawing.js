/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-useless-constructor */
import { DrawingUtils } from '../../utils/drawing-utils'

export class MapDrawing extends DrawingUtils {
  constructor(Settings) {
    super(Settings)
  }

  interpolate(currMap, lpX, lpY, t) {
    const hX = lpX
    const hY = -lpY

    currMap.hX = this.lerp(currMap.hX, hX, t)
    currMap.hY = this.lerp(currMap.hY, hY, t)
  }

  Draw(ctx, currMap) {
    // const point = this.transformPoint(curr_map.hX, curr_map.hY);

    if (currMap.id < 0) return

    this.DrawImageMap(
      ctx,
      currMap.hX * 4,
      currMap.hY * 4,
      currMap.id.toString(),
      825 * 4,
      currMap,
    )
  }

  DrawImageMap(ctx, x, y, imageName, size, currMap) {
    // Fill background => if no map image or corner to prevent glitch textures
    ctx.fillStyle = '#1a1c23'
    ctx.fillRect(0, 0, ctx.width, ctx.height)

    if (!this.settings.showMapBackground) return

    if (imageName === undefined || imageName === 'undefined') return

    const src = '/images/Maps/' + imageName + '.png'

    const preloadedImage = this.settings.GetPreloadedImage(src, 'Maps')

    if (preloadedImage === null) return

    if (preloadedImage) {
      ctx.save()

      ctx.scale(1, -1)
      ctx.translate(250, -250)

      ctx.rotate(-0.785398)
      ctx.translate(-x, y)

      ctx.drawImage(preloadedImage, -size / 2, -size / 2, size, size)
      ctx.restore()
    } else {
      this.settings
        .preloadImageAndAddToList(src, 'Maps')
        .then(() => console.log('Map loaded'))
        .catch(() => console.log('Map not loaded'))
    }
  }
}
