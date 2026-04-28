CREATE INDEX IF NOT EXISTS idx_subscriptions_user
  ON subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer
  ON subscriptions(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub
  ON subscriptions(stripe_subscription_id);
