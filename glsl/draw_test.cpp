#include <iostream>
using namespace std;

#include "GL/gl.h"
#include "math.h"


static const GLfloat vertex_positions[] = 
{
    -1.0f,  -1.0f,  0.0f,   1.0f,
    1.0f,   -1.0f,  0.0f,   1.0f,
    -1.0f,  1.0f,   0.0f,   1.0f,
    -1.0f,  -1.0f,  0.0f,   1.0f,
};


static const GLfloat vertex_colors[] = 
{
    1.0f,   1.0f,   1.0f,   0.0f,
    1.0f,   1.0f,   0.0f,   1.0f,
    1.0f,   0.0f,   1.0f,   1.0f,
    1.0f,   1.0f,   1.0f,   1.0f
};


static const GLushort vertex_indices [] = 
{
    0, 1, 2
};



int main(int argc, char const *argv[])
{
    GLuint ebo;
    glGenBuffers(1, ebo);
    glBindBuffers(GL_ELEMENT_ARRAY_BUFFER, ebo[0]);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(vertex_indices), vertex_indices, GL_STATIC_DRAW);

    GLuint vao[1];
    glGenVertexArrays(1, vao);
    glBindVertexArrays(vao[0]);

    GLuint vbo;
    glGenBuffers(1, vbo);
    glBindBuffers(GL_ARRAY_BUFFER, vbo[0]);
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertex_positions) + sizeof(vertex_colors), NULL, GL_STATIC_DRAW);
    glBufferSubData(GL_ARRAY_BUFFER, 0, sizeof(vertex_positions), vertex_positions);
    glBufferSubData(GL_ARRAY_BUFFER, sizeof(vertex_positions), sizeof(vertex_colors), vertex_colors);

    GLMat3 model_matrix;
    model_matrix = vmath::translation(-3.0f, 0.0f, -5.0f);
    glUniformMatrix4fv(render_model_matrix_loc, 4, GL_FALSE, model_matrix);
    glDrawArrays(GL_TRIANGLES, 0, 3);

    model_matrix = vmath::translation(-1.0f, 0.0f, -5.0f);
    glUniformMatrix4fv(render_model_matrix_loc, 4, GL_FALSE, model_matrix);
    glDrawElements(GL_TRIANGLES, 3, GL_UNSIGNED_SHORT, NULL);



    model_matrix = vmath::translation(1.0f, 0.0f, -5.0f);
    glUniformMatrix4fv(render_model_matrix_loc, 4, GL_FALSE, model_matrix);
    glDrawElementsBaseVertex(GL_TRIANGLES, 3, GL_UNSIGNED_SHORT, NULL, 1);

    model_matrix = vmath::translation(3.0f, 0.0f, -5.0f);
    glUniformMatrix4fv(render_model_matrix_loc, 4, GL_FALSE, model_matrix);
    glDrawArraysInstanced(GL_TRANGLES, 0, 3, 1);

    return 0;
}

