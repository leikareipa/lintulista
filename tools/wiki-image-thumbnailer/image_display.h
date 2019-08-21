/*
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * Lintulista
 *
 */

#ifndef IMAGEDISPLAY_H
#define IMAGEDISPLAY_H

#include <QWidget>
#include <QImage>
#include <QFrame>

class ImageDisplay : public QWidget
{
    Q_OBJECT

public:
    explicit ImageDisplay(QWidget *parent = 0);

    void display_image(const QImage &image);

    QImage get_selected_subregion();

private:
    void paintEvent(QPaintEvent *);
    void mousePressEvent(QMouseEvent *);
    void mouseMoveEvent(QMouseEvent *e);
    void wheelEvent(QWheelEvent *e);

    // Indicators for the areas of the display image we've selected.
    QFrame selectionFrame; // Area hovering around the mouse.
    QFrame selectedFrame;  // Area we've selected by clicking.

    QImage currentDisplayImage;
};

#endif
