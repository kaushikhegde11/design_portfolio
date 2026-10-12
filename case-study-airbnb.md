# Airbnb: the anxious gap

## Problem

Airbnb polishes the booking moment. But every trip has a quieter stretch that the app barely tends: after you pay, and before you check in.

- In that stretch, the user opens the app again for three tasks: check the address, look at the photos, and message the host.

- Five problems live in this window. They spread across two screens.

- Two of the five are clear bugs.

- Three are hierarchy problems. They make an anxious user work harder than needed.

Search-tab amnesia. Highlighted part: the selected tab - lost on the left, remembered on the right.

## Research method

A heuristic pass came first. It scored each screen against Nielsen's ten heuristics. Guerrilla usability sessions came next, on a small sample, run solo. Each session paired a short interview with a timed observation. The person opened a real booking on their own phone. The goal was not statistical weight. The goal was to see where hands hesitated.

User flow of the Search task. Highlighted step: the reset to Home the user never chose.

## Findings

- The clearest finding looked like a visual problem, but it was not.

- Four in five participants never noticed the Home, Experiences, and Services tabs on Search.

- The app reset the choice to Home on every back-navigation, so the tabs never read as real. The cause was state, not styling.

- The booked-trip screen had four faults:

  - It dropped the room-by-room photo grouping that browsing shows.

  - It placed the booking below secondary items.

  - It hid Message your host under the house guide.

  - It listed the house guide twice.

- When asked to arrange the screen, most people chose the same order: the place, then check-in, then the host, then the guide.

80% Never noticed the Home / Experiences / Services tabs

30% Independently chose the photos-first Trips order

2→1 Duplicate house-guide entries, merged to one

Guerrilla test, small sample - directional signal, not statistical weight.

Trips re-ordered to the task. Highlighted part: Message your host, lifted above the guide.

## Solution

- **Keep the last Search tab across back-navigation and sessions.** Then Experiences and Services stop resetting to invisible. The tab is the user's intent. The intent must last until the user changes it, not until the app forgets it. This bug fires on every return trip, so a small fix removes frequent friction.

- **Reorder Trips to match the task:** the place and its photos first, then check-in, then Message your host above the guide, then the guide once. Screen order follows task order. An anxious guest wants a person first, so Message your host sits above the guide. One guide replaces two, so nothing competes for the same job.

- **Bring the categorized photos into the booked state behind an info control** - bedrooms, kitchen, and spaces, the same groups as the browse view. Then the same place behaves the same way before and after payment. Payment must not delete information. The guest built a mental model before booking, so the booked screen keeps it. The info control hides the detail until the guest asks, which keeps the screen calm.

Each decision traces to one guest in one moment: paid, anxious, and before check-in. Two fixes correct state bugs. The rest correct hierarchy. The screen order and the visual weight now match what the guest does next.

Browse vs. booked photos. Highlighted part: the info affordance that brings back the room grouping.

## Who feels it

**Maya, the planner.** Reopens a booking six times before a trip to plan rooms and screenshot the address. Wants the place and its photos first.

**Deepak, the explorer.** Would live in the Experiences tab - but never formed the habit, because the app never let the choice persist.

**Rina, the first-timer.** Anxious before check-in. Sees two house guides and cannot tell which one is real.

[Visual case study](case-study-airbnb.html) · [Projects](projects.md)
