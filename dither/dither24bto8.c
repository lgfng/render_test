/* dither rgb to 8-color excample 
   from http://www.cubic.org/source/archive/coding/algorith/
   --pclion
*/
unsigned char line[3][WIDTH];
unsigned char colormap[3][COLORS] = {
      0,   0,   0,     /* Black       This color map should be replaced   */
    255,   0,   0,     /* Red         by one available on your hardware.  */
      0, 255,   0,     /* Green       It may contain any number of colors */
      0,   0, 255,     /* Blue        as long as the constant COLORS is   */
    255, 255,   0,     /* Yellow      set correctly.                      */
    255,   0, 255,     /* Magenta                                         */
      0, 255, 255,     /* Cyan                                            */
    255, 255, 255 };   /* White                                           */

int getline();               /* Function to read line[] from image file;  */
                             /* must return EOF when done.                */
putdot(int x, int y, int c); /* Plot dot of color c at location x, y.     */

dither()
{
    static int ed[3][WIDTH] = {0};      /* Errors distributed down, i.e., */
                                        /* to the next line.              */
    int x, y, h, c, nc, v,              /* Working variables              */
        e[4],                           /* Error parts (7/8,1/8,5/8,3/8). */
        ef[3];                          /* Error distributed forward.     */
    long dist, sdist;                   /* Used for least-squares match.  */

    for (x=0; x<WIDTH; ++x) {
        ed[0][x] = ed[1][x] = ed[2][x] = 0;
    }
    y = 0;                              /* Get one line at a time from    */
    while (getline() != EOF) {          /* input image.                   */

        ef[0] = ef[1] = ef[2] = 0;      /* No forward error for first dot */

        for (x=0; x<WIDTH; ++x) {
            for (c=0; c<3; ++c) {
                v = line[c][x] + ef[c] + ed[c][x];  /* Add errors from    */
                if (v < 0) v = 0;                   /* previous pixels    */
                if (v > 255) v = 255;               /* and clip.          */
                line[c][x] = v;
            }

            sdist = 255L * 255L * 255L + 1L;        /* Compute the color  */
            for (c=0; c<COLORS; ++c) {              /* in colormap[] that */
                                                    /* is nearest to the  */
#define D(z) (line[z][x]-colormap[c][z])            /* corrected color.   */

                dist = D(0)*D(0) + D(1)*D(1) + D(2)*D(2);
                if (dist < sdist) {
                    nc = c;
                    sdist = dist;
                }
            }
            putdot(x, y, nc);           /* Nearest color found; plot it.  */

            for (c=0; c<3; ++c) {
                v = line[c][x] - colormap[c][nc];   /* V = new error; h = */
                h = v >> 1;                         /* half of v, e[1..4] */
                e[0] = (7 * h) >> 3;                /* will be filled     */
                e[1] = h - e[0];                    /* with the Floyd and */
                h = v - h;                          /* Steinberg weights. */
                e[2] = (5 * h) >> 3;
                e[3] = h = e[2];

                ef[c] = e[0];                       /* Distribute errors. */
                if (x < WIDTH-1) ed[c][x+1] = e[1];
                ed[c][x] += e[2];
                if (x > 0) ed[c][x-1] += e[3];
            }
        } /* next x */

        ++y;
    } /* next y */
}

