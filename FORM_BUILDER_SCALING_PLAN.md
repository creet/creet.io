# Scalable Architecture Plan for PraiseGarden Form Builder

## 1. Overview

This document outlines the technical plan to transform the current PraiseGarden form builder into a dynamic, scalable, and secure system. The core strategy is to adopt a **Configuration-Driven UI** approach. Instead of building static pages, we will store a form's entire structure and styling as a JSON object in the database. This "blueprint" will then be used to render the form for both the builder and the public-facing collection page.

This approach provides maximum flexibility, security, and performance.

---

## 2. Current State Analysis

Before detailing the plan, let's inventory the existing components that make up the form builder.

-   **Main Page:** `src/app/dashboard/form-builder/page.tsx`
    -   This is the primary container for the form builder interface.
-   **Control Panel:** `src/components/FormBuilderSidebar.tsx`
    -   The UI for adding, removing, and reordering form elements.
-   **Form "Block" Components:** These are the individual "pages" or steps of the current form.
    -   `WelcomeCard.tsx`
    -   `QuestionCard.tsx`
    -   `RatingCard.tsx`
    -   `AboutYouCard.tsx`
    -   `AboutCompanyCard.tsx`
    -   `ConsentCard.tsx`
    -   `ThankYouCard.tsx`
    -   (And others like `NegativeFeedbackCard`, `PrivateFeedbackCard`, etc.)

Currently, these components are largely static. The plan below details how to make them fully dynamic and configurable by the user.

---

## 3. The Core Principle: The JSON Blueprint

The heart of the new architecture will be the JSON object stored in the `settings` column of your `forms` table in Supabase. This object is the single source of truth for a form's structure and appearance.

### Example `settings` JSON:

```json
{
  "theme": {
    "backgroundColor": "#F9FAFB",
    "primaryColor": "#10B981",
    "textColor": "#1F2937",
    "buttonTextColor": "#FFFFFF"
  },
  "blocks": [
    {
      "id": "block_welcome_123",
      "type": "welcome-card",
      "props": {
        "title": "Share your experience with us!",
        "message": "Your feedback is invaluable. This will only take a moment.",
        "textColor": "#111827"
      }
    },
    {
      "id": "block_rating_456",
      "type": "rating-card",
      "props": {
        "question": "How would you rate our product overall?",
        "textColor": "#374151"
      }
    },
    {
      "id": "block_question_789",
      "type": "question-card",
      "props": {
        "question": "What is the single biggest benefit you've received?",
        "placeholder": "e.g., It helped me save 10 hours per week!",
        "isRequired": true,
        "textColor": "#374151"
      }
    },
    {
      "id": "block_about_you_abc",
      "type": "about-you-card",
      "props": {
         "fields": ["name", "title", "avatar"],
         "textColor": "#374151"
      }
    },
    {
      "id": "block_thankyou_012",
      "type": "thank-you-card",
      "props": {
        "title": "Thank you!",
        "message": "We've received your testimonial.",
        "textColor": "#111827"
      }
    }
  ]
}
```

---

## 4. Step-by-Step Implementation Plan

### Step 4.1: Make the Form Builder Dynamic

The form builder becomes a "JSON editor."

1.  **Central State:** In `form-builder/page.tsx`, use a React state (e.g., `useState` or a state management library) to hold the entire form configuration JSON.
2.  **Fetch Data:** On page load, fetch the form's `settings` JSON from Supabase and populate this state.
3.  **Modify Components:** Refactor each `...Card.tsx` component. Instead of hardcoded text and styles, they will now accept props. The parent page will map over the `blocks` array from the state and render the appropriate card, passing in the `props` object.
    -   **Example (`WelcomeCard.tsx`):**
        ```tsx
        // Before
        // <h1>Hardcoded Title</h1>

        // After
        interface WelcomeCardProps {
          title: string;
          message: string;
          textColor: string;
        }

        export const WelcomeCard = ({ title, message, textColor }: WelcomeCardProps) => {
          return (
            <div>
              <h1 style={{ color: textColor }}>{title}</h1>
              <p style={{ color: textColor }}>{message}</p>
            </div>
          );
        };
        ```
4.  **Update State:** The controls in `FormBuilderSidebar.tsx` (e.g., color pickers, text inputs) will no longer directly manipulate the cards. Instead, they will dispatch actions to update the central JSON state. The UI will then "react" to these changes and re-render the preview.

### Step 4.2: Create the Public Form Renderer

This is the lightweight, secure, and fast page that end-users will see.

1.  **New Route:** Create a new page at `src/app/collect/[formId]/page.tsx`.
2.  **Server-Side Rendering (SSR):** Use a server component to fetch the form's `settings` JSON from Supabase based on the `formId` from the URL. This is fast and secure, as the database call happens on the server, not the client's browser.
3.  **Renderer Component:** Create a `PublicFormRenderer` component that takes the fetched JSON as a prop.
4.  **Block Mapping:** This component will map over the `blocks` array and use a `switch` statement or an object mapping to render the correct public-facing version of each component. These components are for display and input only—they contain no builder logic.
    ```tsx
    // Example Renderer Logic
    block.map(b => {
      switch (b.type) {
        case 'welcome-card':
          return <PublicWelcomeCard {...b.props} />;
        case 'rating-card':
          return <PublicRatingCard {...b.props} />;
        // ... and so on
      }
    })
    ```
5.  **Security:** Because you are rendering data with React, any malicious code injected into the form's text fields will be automatically escaped and rendered as plain text, preventing XSS attacks.

### Step 4.3: Handle Form Submissions

1.  **Client-Side State:** The public form will manage the user's answers in a simple React state.
2.  **API Endpoint:** Create an API route (e.g., `src/app/api/testimonials/submit/route.ts`).
3.  **Submit Action:** When the user clicks "Submit," the form will POST a clean JSON object of their answers to this endpoint, along with the `formId` and `projectId`.
4.  **Database Insert:** The API route will validate the data and insert a new row into the `testimonials` table in your Supabase database.

---

## 5. Scaling to New Form Types (The Future)

The user asks: "How can we add 3-4 extra forms with entirely different structures?"

This architecture makes it incredibly simple. **You don't build new "forms"; you build new "blocks."** The form is just a collection of these blocks.

### Scenario: Adding a "Net Promoter Score (NPS)" Form

Let's say you want to create a form that just asks for an NPS score and a comment.

1.  **Create New Block Components:**
    -   Create `NPSCard.tsx` for the builder preview.
    -   Create `PublicNPSCard.tsx` for the public renderer. This would contain the 0-10 radio buttons and a text area.
2.  **Define the New Block Type:**
    -   You've just invented a new block. Its `type` is `"nps-card"`.
    -   Its `props` might be `{ "question": "How likely are you to recommend us?", "lowLabel": "Not Likely", "highLabel": "Very Likely" }`.
3.  **Update the "Factories":**
    -   In the **builder**, add "NPS Score" to the `FormBuilderSidebar.tsx` so users can add it to their form.
    -   In the **public renderer**, add a new case to your mapping logic:
        ```tsx
        case 'nps-card':
          return <PublicNPSCard {...b.props} />;
        ```

**That's it.** You have now expanded the capabilities of the entire system without changing the database schema or any core logic. A user can now create a "form" that is just an NPS block and a Thank You block. Or they can add an NPS block to their existing, longer testimonial form.

This block-based, configuration-driven model means you can scale to an infinite variety of form types simply by creating new, self-contained block components.
