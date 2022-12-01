$(function () {
    $wheight = $(window).height();
    $('.container').height($wheight / 2 + 60);
    $('.container').css('padding-top', $wheight / 2 - 60 + 'px');

    $(window).resize(function () {
        $wheight = $(window).height();
        $('.container').height($wheight / 2 + 60);
        $('.container').css('padding-top', $wheight / 2 - 60 + 'px');
    });
});