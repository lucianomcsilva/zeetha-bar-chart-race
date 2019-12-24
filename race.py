#!/usr/bin/env python3
import datetime
import math
from ros_metrics.rosdistro import get_rosdistro_repo, classify_commit
from tqdm import tqdm

# Distros
distros = [
  'fuerte',
  'groovy',
  'hydro',
  'indigo',
  'jade',
  'kinetic',
  'lunar',
  'melodic',
  #'noetic',
  'ardent',
  'bouncy',
  'crystal',
  'dashing',
  'eloquent',
  #'foxy',
]

# Populate empty data
def initialize():
    race = {}
    year_number = 2012
    month_number = 1
    while year_number < 2020:
      month = month_decimal(year_number, month_number)

      race[month] = {}
      for distro in distros:
          race[month][distro] = {
            'count': 0,
            'ranking': 0}

      if month_number < 12:
          month_number += 1
      else:
          month_number = 1
          year_number += 1

    return race


def month_decimal(year, month):
    return math.floor(100*(year + month / 12))/100

if __name__ == '__main__':

    # Clone or update the repo in the cache
    repo = get_rosdistro_repo(update=True)

    commits = list(reversed(list(repo.iter_commits())))

    race = initialize()

    # Keep track of distros seen and ignored to print messages
    not_distro = []
    seen_distro = []

    current_year = 2012
    count = 0

    try:
        main_path = set()

        # Iterate over commits
        print('Iterating over [', len(commits), '] commits')
        for commit_id, commit in enumerate(tqdm(commits)):
            main_path.add(commit.hexsha)

            commit_dict, classifications = classify_commit(repo, main_path, commit, commit_id)

            if not classifications:
                continue

            for classification in classifications:
                distro = classification.get('detail')

                if distro not in distros:
                    if distro not in not_distro:
                        print('Ignoring [', distro, ']')
                        not_distro.append(distro)
                    continue

                date = datetime.datetime.fromtimestamp(commit_dict.get('date'))
                if date.year != current_year:
                    print('Year [', date.year, ']')
                    current_year = date.year

                date_decimal = month_decimal(date.year, date.month)

                if date_decimal not in race:
                    print ('Unknown date: ', date_decimal)
                    continue

                if distro not in seen_distro:
                    print('Saw [', distro, ']')
                    seen_distro.append(distro)

                race[date_decimal][distro]['count'] += 1

            count += 1
            #if count % 10 == 0:
            #    print('Count [', count, ']')
            #if count > 200:
            #    break

        print('Accummulating and ranking')
        previous_month = ''
        for month in race:

            dists = {}
            for distro in race[month]:
                # Accummulate
                if previous_month != '':
                    race[month][distro]['count'] += race[previous_month][distro]['count']

                # Sort by number of commits
                dists[distro] = race[month][distro]['count']
            sorted_dists = {k: v for k, v in sorted(dists.items(), key = lambda item:(item[1]), reverse=True)}

            # Fill ranking
            rank = 1
            for distro in sorted_dists:
                race[month][distro]['ranking'] = rank
                rank += 1

            previous_month = month

        path = '/tmp/race.csv'
        print('Writing to file [', path, ']')
        csv = open(path,"w+")
        csv.write('name,value,year,lastValue,rank\n')

        previous_month = ''
        for month in race:
            if previous_month == '':
                previous_month = month

            for distro in race[month]:
                name = distro
                year = month
                rank = race[month][distro]['ranking']
                value = race[month][distro]['count']
                lastValue = race[previous_month][distro]['count']
                if value == 0 and lastValue == 0:
                    csv.write('%s,NA,%f,NA,%i\n' %(name, year, rank))
                elif value == 0:
                    csv.write('%s,NA,%f,%i,%i\n' %(name, year, lastValue, rank))
                elif lastValue == 0:
                    csv.write('%s,%i,%f,NA,%i\n' %(name, value, year, rank))
                else:
                    csv.write('%s,%i,%f,%i,%i\n' %(name, value, year, lastValue, rank))
            previous_month = month

    except KeyboardInterrupt:
        pass

