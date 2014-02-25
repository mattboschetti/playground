#!/usr/bin/python

import argparse
import sys
import fnmatch
from os import walk


def parse_input_arguments(argv):
    arg_parser = argparse.ArgumentParser(
        prog=argv[0],
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
        description='Look for annotation count')

    arg_parser.add_argument('-v',
                            '--version',
                            action='version',
                            version='at-finder 0.1')
    arg_parser.add_argument('-d',
                            '--details',
                            action='store_true',
                            help='Display detailed information')
    arg_parser.add_argument('path',
                            type=str,
                            help='Directory to scan')
    arg_parser.add_argument('annotation',
                            type=str,
                            help='Annotation to look for')
    try:
        args = arg_parser.parse_args()
    except Exception as e:
        print(e)
        raise SystemExit(-1)

    dir_to_scan = args.path
    annotation = args.annotation
    details = args.details
    return (dir_to_scan, annotation, details)


def main(argv):
    dir_to_scan, annotation, details = parse_input_arguments(argv)
    file_extensions = ['*.java', '*.m', '*.h', '*.py', '*.js', '*.scala']
    files = find_files(dir_to_scan, file_extensions)

    metrics = {}
    
    for f in files:
        annotation_lines = find_annotations(f, annotation)
        if not annotation_lines:
            continue
        
        lines = metrics.get(f, [])
        lines.extend(annotation_lines)
        metrics[f] = lines

    count = reduce(lambda x, y: x + len(y), metrics.values(), 0)
    
    if details:
        print('{0} {1} occurrences in {2} files'.format(count, annotation, len(files)))
    else:
        print(count)
    return 0


def find_files(base_dir, patterns):
    found_files = []
    for (dirpath, dirnames, filenames) in walk(base_dir):
        for pattern in patterns:
            for filename in fnmatch.filter(filenames, pattern):
                found_files.append('{0}/{1}'.format(dirpath, filename))
    return found_files


def find_annotations(file_name, annotation):
    lines = [line.rstrip('\n') for line in open(file_name, 'r')]
    return filter(lambda line: annotation in line, lines)


def entry_point():
    """Zero-argument entry point for use with setuptools/distribute."""
    raise SystemExit(main(sys.argv))


if __name__ == '__main__':
    entry_point()    
