#!/usr/bin/perl
# Batch grid dumper. Reads cases from STDIN, one per line:
#   tuning|harpKey|songKey|position|calculate
# Emits, for each case, a block:
#   @@@ <the original case line>
#   <grid text, same format as the React port's render()>
use strict;
use warnings;
use lib '/app/perl';
use HarpLayout::Harmonica::Table;

while (my $line = <STDIN>) {
    chomp $line;
    next unless length $line;
    my ($tuning, $harp_key, $song_key, $position, $calculate) = split /\|/, $line;
    $calculate ||= 'song_key';

    my $h = HarpLayout::Harmonica::Table->new(
        tuning    => $tuning,
        harp_key  => $harp_key,
        song_key  => $song_key,
        position  => $position,
        calculate => $calculate,
    );

    my @holeNums = $h->holeNums;
    my $numHoles = scalar @holeNums;

    my $cell = sub {
        my $n = shift;
        return '.' unless defined $n;
        return $n->position_interval . '/' . $n->note . '/' . $n->type;
    };
    my $row_text = sub {
        my $row = shift;
        join("\t", map { $cell->($row->[$_]) } 0 .. $numHoles - 1);
    };

    print "\@\@\@ $line\n";
    print "tuning=" . $h->tuning . " harp=" . $h->harp_key
        . " song=" . $h->song_key . " pos=" . $h->position
        . " holes=$numHoles\n";
    print "-- blow (top..bottom) --\n";
    print $row_text->($_), "\n" for $h->blowNotes;
    print "holes: " . join("\t", @holeNums) . "\n";
    print "-- draw (top..bottom) --\n";
    print $row_text->($_), "\n" for $h->drawNotes;
}
