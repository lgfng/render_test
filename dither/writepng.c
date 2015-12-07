#define PNG_USER_MEM_SUPPORTED
#include <malloc.h>
#include "png.h"

typedef struct {
	png_bytep databeg;
	png_bytep dataend;
	png_bytep datap;
	int error;
} png_mem_file;

void write_data_fn(png_structp png_ptr,
        png_bytep data, png_size_t length)
{
	register png_mem_file *memfile;

	memfile = (png_mem_file *) (png_ptr->io_ptr);
	if (memfile->error == 1) {
		png_warning(png_ptr, "try to write an error file...\n");
		return;
		}
	if (memfile->datap + length >= memfile->dataend) {
		memfile->error =1;
		return;
		}

	memcpy(memfile->datap, data, length);
	memfile->datap += length ;
}
/*****************************************************
return bytes of memory file, 
       -1 for error(buffer no enough to write file)
*****************************************************/
int writepng(png_bytep pngbuf, png_uint_32 length, 
			 int width, int height, int bit_depth,
			 int color_type, int interlace_type,
			 png_colorp palette, int num_palette, int trans, int bgcolor,
			 png_bytepp row_pointers)
{
	png_structp png_ptr;
	png_infop info_ptr;
//	jmp_buf jbuf;
//	struct errstruct errinfo;
	png_mem_file *memfile;
	png_color_16 background;
/*If you want to use your own memory allocation routines, 
define PNG_USER_MEM_SUPPORTED 
and use png_create_write_struct_2() instead of png_create_read_struct()
*/
/*
	png_structp png_ptr = png_create_write_struct_2
       (PNG_LIBPNG_VER_STRING, (png_voidp)user_error_ptr,
        user_error_fn, user_warning_fn, (png_voidp)
        user_mem_ptr, user_malloc_fn, user_free_fn);
*/
	png_ptr = png_create_write_struct_2
       (PNG_LIBPNG_VER_STRING, (png_voidp)NULL,
        NULL, NULL, (png_voidp)
        NULL, NULL, NULL);
    if (!png_ptr)
        return -1;
    
    info_ptr = png_create_info_struct(png_ptr);
    if (!info_ptr) {
        png_destroy_read_struct(&png_ptr, (png_infopp)NULL,
           (png_infopp)NULL);
        return -1;
		}

#ifndef PNG_SETJMP_NOT_SUPPORTED
	if (setjmp(png_ptr->jmpbuf)) {
        png_destroy_write_struct(&png_ptr, &info_ptr);
        return -1;
    }
#endif
	memfile = (png_mem_file*)malloc(sizeof(png_mem_file));
	memfile->databeg = memfile->datap = pngbuf;
	memfile->dataend = pngbuf +length;
	memfile->error =0;
/*
	set png_ptr->io_ptr = memfile, alternate by png_set_write_fn
	png_init_io(png_ptr, memfile);
*/

/*
	png_set_read_fn(png_structp read_ptr,
        voidp read_io_ptr, png_rw_ptr read_data_fn)
*/
/*
    png_set_write_fn(png_structp png_ptr,
        voidp write_io_ptr, png_rw_ptr write_data_fn,
        png_flush_ptr output_flush_fn);
*/
    png_set_write_fn(png_ptr, (voidp)memfile, write_data_fn,
        NULL);

/*
The replacement I/O functions should have prototypes as follows: 

void user_read_data(png_structp png_ptr,
        png_bytep data, png_uint_32 length);
    void user_write_data(png_structp png_ptr,
        png_bytep data, png_uint_32 length);
    void user_flush_data(png_structp png_ptr);

png_set_error_fn(png_structp png_ptr,
        png_voidp error_ptr, png_error_ptr error_fn,
        png_error_ptr warning_fn);
*/


//    png_voidp error_ptr = png_get_error_ptr(png_ptr);
/*
void user_error_fn(png_structp png_ptr,
        png_const_charp error_msg);
    void user_warning_fn(png_structp png_ptr,
        png_const_charp warning_msg);
*/

/*
	filters type =
	   PNG_FILTER_NONE | PNG_FILTER_SUB |
	   PNG_FILTER_VALUE_UP | PNG_FILTER_VALUE_AVG
       PNG_FILTER_PAETH);
let libpng to do it default
    png_set_filter(png_ptr, 0, PNG_FILTER_NONE);
*/
/*
// set the zlib compression level, the default is faster,Z_BEST_COMPRESSION is slowest
    png_set_compression_level(png_ptr,
        Z_BEST_COMPRESSION);

 //    set other zlib parameters
    png_set_compression_mem_level(png_ptr, 8);
    png_set_compression_strategy(png_ptr,
        Z_DEFAULT_STRATEGY);
    png_set_compression_window_bits(png_ptr, 15);
    png_set_compression_method(png_ptr, 8);
*/
/*
	png_set_IHDR(png_ptr, info_ptr, width, height,
       bit_depth, color_type, interlace_type,
       compression_type, filter_type);
*/    
	png_set_IHDR(png_ptr, info_ptr, width, height,
       bit_depth, color_type, interlace_type,
       PNG_COMPRESSION_TYPE_DEFAULT, PNG_FILTER_TYPE_DEFAULT);

//    png_set_gAMA(png_ptr, info_ptr, gamma);
//now set the palette
    png_set_PLTE(png_ptr, info_ptr, palette, num_palette);

 /*
    palette        - the palette for the file
                     (array of png_color)
    num_palette    - number of entries in the palette
*/   

//    png_set_bKGD(png_ptr, info_ptr, background);
/*
png_set_bKGD(png_structp png_ptr, png_infop info_ptr, png_color_16p background)
    background     - background color (PNG_VALID_bKGD)
*/
/*
    png_set_tRNS(png_ptr, info_ptr, trans, num_trans,
       trans_values);
    trans          - array of transparent entries for
                     palette (PNG_INFO_tRNS)
    trans_values   - transparent pixel for non-paletted
                     images (PNG_INFO_tRNS)
    num_trans      - number of transparent entries
                     (PNG_INFO_tRNS)
*/
	if (trans>=0)
		png_set_tRNS(png_ptr, info_ptr, (png_bytep)&trans, 1, NULL);
	if (bgcolor>=0) {
		background.index = bgcolor;
		png_set_bKGD(png_ptr, info_ptr, &background);
		}
// write all of png_set_XXX chunks between IHDR and IDAT
	png_write_info(png_ptr, info_ptr);

	if (bit_depth < 8)
        png_set_packing(png_ptr);
// now write the IDAT
	png_write_image(png_ptr, row_pointers);

	png_write_end(png_ptr, info_ptr);
	png_destroy_write_struct(&png_ptr, &info_ptr);

	if (memfile->error == 0)
		return memfile->datap - memfile->databeg;
	else
		return -1;
}//writepng()


