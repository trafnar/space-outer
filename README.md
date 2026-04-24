### What problem I solved

My daughter's math scores come through ThinkCentral, a portal so slow and cumbersome that I manually extract the data out of their system so I can review it without losing my sanity. Parents want the results fast, and the most important thing to do with those results is to practice mistakes. Space Outer is a focused tool for exactly that loop: a test list, a results view, and a printable worksheet built from the questions the parent picks.

### Key decisions I made and why

I decided to focus the app around the results view for tests and to present it as a dense data table. Treating this like a table is the type of UI I need as a parent to get in and out fast. I stripped out any unessential UI, focusing on the primary actions of viewing a question to see what was wrong, what was right, and then adding questions to a worksheet.

When you click over to the worksheet, you see a preview and a big button to print it out. I made sure it fits nicely on an 8.5x11 sheet with nice margins and no wasted space (I don't like printing extra sheets of paper), but it also breaks problems at page boundaries so you don't get one problem split across two pages. I've had this problem with my daughter where I printed out a worksheet, half the problem was on one page and half on the next. She got confused and spent a bunch of time working on the wrong thing.

I tried to inject just the right amount of whimsy, from the logo, to the eyeball visibility indicators to the smiley faces that indicate scores. The smiley faces are intentionally slightly silly because I know it's a stressful thing when I bring my daughter over and say, "Look at these problems you got wrong." Seeing a bunch of red "wrong" isn't fun. That silly little face that might lighten the blow in this kind of high-anxiety situation.​

Most of the time, I'm going to print the sheet and hand it to her. It's a great feeling handing her a paper with exactly the problems she needs to look at, without her having to log into some system or click through a bunch of things. She doesn't need to be on a screen. She can just focus on the problems and move on with her day.

Everything on ThinkCentral loads very slowly. Space Outer is a static site, so everything is pre-built and loads quickly. There's keyboard navigation, so I can quickly navigate through questions and mark ones for review. I've put in a lot of thoughtful details: padding out button click areas, brush selection across the "add to worksheet" buttons, maximizing the size of the content on the page, and allowing the user to scroll past the bottom of the table so they can comfortably bring the last problem up into the center of their field of view. Things that respect the parent and their time.

### Tradeoffs I made and what I gave up

As it exists now, this works for my family only. Aside from that, this is real, not a throwaway prototype. The UI quality is shippable, and I'm already using it with my daughter.

### Assumptions I operated under

I needed to get the test data into the system out of ThinkCentral, and I've been doing that by manually pulling data and screenshotting the problems. Even that is really hard to do.

So, I dedicated a good portion of the time I spent on this project to building a system to ingest all the test data from ThinkCentral so I have it locally. There's no API or easy way to do that, it's a bunch of scripts cobbled together. For this project, having that data already ingested is the assumption I'm operating under. Space Outer showcases how the data could be displayed given that we have it available.

### What I'd do with more time

In a perfect world, I'd build a Chrome extension where I can visit the ThinkCentral page and click a button to download all the data into Space Outer, closing the loop between the source system and the tool. Then, I could make it available to other parents.

I'd also like to add the ability to generate more questions based on the ones that were wrong. This would be hugely helpful for giving extra practice with new problems.

A way to fill out the worksheet online would be nice, and those could even be recorded as tests in the system.

Lastly, I'd fill in some gaps such as: Dark mode, filtering options, tooltips/instructions.

### List of fun UI details ;)

- Adjustment of the back-home button to align with content, despite button active area size being bigger.
- The number inside the review button fades along with the button background on hover.
- Can scroll past the bottom, bringing the last item in a table up to a comfortable viewing position.
- Animations are removed, sped-up, or exit-only in most cases to make the app feel fast and utilitarian, not cute.
- Underline of question fill-in blanks are slightly thinner when printing.
- No gap in click-ability on the homepage table rows, even considering the border between rows.
- Homepage table links are standard links despite being in table rows, to preserve link behavior like "open in new tab".
- Using keyboard to navigate up and down the row selection scrolls the page table when you reach the ends, accounting for the sticky header on top and for the 1px border so you aren't left with a double-thick border.
- In the worksheet menu "Add all" is disabled when all are already added; "add wrong" disabled when the wrong ones are already added.
- Optical centering of the not-found page's centered content.
- P3 colors for smileys.
- Brush-select on the "add for review" button means you can click down, then mouse up or down freely to select all items the cursor passes by.
- The setting to reveal answers is stored independently for each test and each worksheet, the test page defaults to showing, and the worksheet page defaults to hiding.
- The highlight for selected row is an inset fill, which makes the "expand" option have a nice selection state that doesn't feel cut off.
- Keyboard and focus management are carefully set up. Things like "press escape to close sidebar sheet" then subsequent "press escape to remove focus from table" work.
- The back button is adjusted left so it lines up with other elements in the table below
- The standards tooltip handles multiple standards, no standards and standard with title only.
- The worksheet button is disabled when it has no items, but if the user navigates there anyways, they see a nice empty state.
- The pop-up question view is top-aligned instead of centered so the prev/next buttons don't shift if you click to a question that is a different height.
- Question pop-up can scroll if it doesn't fit vertically in the browser.
- Aria labels on icon buttons.
- Aria-hidden on hidden table rows when using the "expand" mode
- Dynamic changing of "clear worksheet items" label. When there are none to clear it is disabled and says "clear all", when it has items it says "clear 6" so we never show "clear 0" which looks awkward.
- Header in the worksheet aligns with the header of the test page.
- Padded toolbar items for a healthy click area.
- Fade out of question text when revealing the question in the "expand" mode.
- The "standards" hover card appears on the left instead of top, so it doesn't block your curso as you move up and down the list. I did this instead of making it non-interactive, because people might want to copy the text.
- Subtle fade of the slash between numbers in the score (2/4 points)
- Uses break-inside: avoid + page-break-inside: avoid to avoid page breaks when printing.
