#!/bin/bash


# commit-helper


# Define commit types
types=("feat" "fix" "docs" "style" "refactor" "perf" "test" "chore" "ci" "build")

# Define commit scopes relevant to your DEX project
scopes=("swap" "bridge" "wallet"  "ui" "api" "config" "deps" "types")

# Prompt user to select commit type
echo "Select commit type:"
select type in "${types[@]}"; do
  if [[ -n "$type" ]]; then
    break
  else
    echo "❌ Invalid selection. Try again."
  fi
done

# Prompt user to select commit scope
echo "Select commit scope:"
select scope in "${scopes[@]}" "custom"; do
  if [[ "$scope" == "custom" ]]; then
    read -p "Enter custom scope: " custom_scope
    scope="$custom_scope"
    break
  elif [[ -n "$scope" ]]; then
    break
  else
    echo "❌ Invalid selection. Try again."
  fi
done

# Get short commit message
read -p "🔤 Enter a short commit message: " message

# Get optional detailed description
read -p "📝 Enter a detailed description (optional, press Enter to skip): " details

# Get optional issue reference
read -p "🔗 Reference an issue (optional, e.g., #123): " issue

# Optional edit in interactive editor
read -p "✏️ Do you want to edit the commit message in your editor before committing? (y/n): " edit_choice

# Compose commit message
commit_msg="$type($scope): $message"

if [[ -n "$details" ]]; then
  commit_msg+="

$details"
fi

if [[ -n "$issue" ]]; then
  commit_msg+="

Closes $issue"
fi

# Perform the commit
if [[ "$edit_choice" == "y" || "$edit_choice" == "Y" ]]; then
  echo -e "$commit_msg" > .git/COMMIT_EDITMSG
  git commit --edit -F .git/COMMIT_EDITMSG
  rm .git/COMMIT_EDITMSG
else
  git commit -m "$commit_msg"
fi

echo -e "\n✅ Commit created successfully!"
